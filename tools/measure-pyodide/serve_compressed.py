"""Static server for the measurement harness that actually applies compression.

`python -m http.server` sends no `Content-Encoding`, so a measurement served by it reports
uncompressed bytes. The upstream roadmap figure is a download figure, which means the comparison
is only like-for-like when the server compresses. This server gzips text and wasm payloads on the
fly when the client advertises support, and says plainly which encoding it used per request.
"""

from __future__ import annotations

import gzip
import http.server
import socketserver
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8802
ROOT = Path(__file__).resolve().parent

# Already-compressed formats gain nothing from re-compressing; leaving them alone keeps the
# measurement honest about what the server actually did.
SKIP_SUFFIXES = {".bz2", ".gz", ".zip", ".br", ".png", ".jpg", ".woff2"}
COMPRESSIBLE = {
    ".wasm": "application/wasm",
    ".mjs": "text/javascript",
    ".js": "text/javascript",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json",
    ".py": "text/x-python; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
}


class CompressingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):  # noqa: D102 - inherited contract
        suffix = Path(str(path)).suffix.lower()
        return COMPRESSIBLE.get(suffix, super().guess_type(path))

    def do_GET(self):  # noqa: N802 - inherited contract
        target = (ROOT / self.path.lstrip("/").split("?")[0]).resolve()
        accepts = self.headers.get("Accept-Encoding", "")
        suffix = target.suffix.lower()

        if (
            "gzip" in accepts
            and target.is_file()
            and suffix not in SKIP_SUFFIXES
            and suffix in COMPRESSIBLE
        ):
            raw = target.read_bytes()
            body = gzip.compress(raw, compresslevel=6)
            # Only claim gzip when it actually helped; otherwise send the raw bytes untouched.
            if len(body) < len(raw):
                self.send_response(200)
                self.send_header("Content-Type", COMPRESSIBLE[suffix])
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(body)
                sys.stderr.write(
                    f"gzip  {self.path}: {len(raw)} -> {len(body)} bytes\n"
                )
                return

        sys.stderr.write(
            f"plain {self.path}: served uncompressed (client did not offer gzip, or gzip did "
            f"not shrink the payload)\n"
        )
        super().do_GET()

    def log_message(self, fmt, *args):  # noqa: D102 - quieter output
        sys.stderr.write("http  " + (fmt % args) + "\n")


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), CompressingHandler) as httpd:
        sys.stderr.write(f"compressing static server on http://127.0.0.1:{PORT}/ (root {ROOT})\n")
        httpd.serve_forever()
