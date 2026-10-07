"""Download the pinned pyodide-core release and report its unpacked size.

Only the Python standard library is used. The download lands under vendor/pyodide-core/
so that index.html can be served statically, which is what the upstream documentation
describes for an offline or local deployment.

Why a pinned release: the numbers published in the Pyodide roadmap belong to documentation
version 0.19.1 and are not confirmed for 314.0.7 (HL §9 R9), so the measurement must name
the exact release it measured.
"""

from __future__ import annotations

import argparse
import sys
import tarfile
import urllib.error
import urllib.request
from pathlib import Path

VERSION = "314.0.7"
# The published core asset is pyodide-core-{VERSION}.tar.bz2, confirmed against the GitHub releases
# API on 2026-10-07 and consistent with the upstream deployment page for this version.
#
# Correction: an earlier revision of this file claimed the upstream page wrongly described the asset
# as .tar.gz. That claim was false -- the reachable 314.0.7 page, its _sources markdown and the 0.19.1
# page all say .tar.bz2 -- and it was retracted after independent review (finding F5). The original
# error was in the harness, not in the documentation.
ARCHIVE = f"pyodide-core-{VERSION}.tar.bz2"
DEFAULT_URL = f"https://github.com/pyodide/pyodide/releases/download/{VERSION}/{ARCHIVE}"

HERE = Path(__file__).resolve().parent
VENDOR = HERE / "vendor"
TARGET = VENDOR / "pyodide-core"


def human(count: int) -> str:
    value = float(count)
    for unit in ("B", "KiB", "MiB", "GiB"):
        if value < 1024 or unit == "GiB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} B"
        value /= 1024
    return f"{count} B"


def download(url: str, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        print(f"archive already present: {destination} ({human(destination.stat().st_size)})")
        return destination
    print(f"downloading {url}")
    try:
        with urllib.request.urlopen(url, timeout=120) as response, destination.open("wb") as handle:
            while chunk := response.read(1 << 20):
                handle.write(chunk)
    except urllib.error.URLError as exc:
        destination.unlink(missing_ok=True)
        raise SystemExit(f"download failed: {exc}") from exc
    compressed = destination.stat().st_size
    print(f"downloaded {human(compressed)} compressed")
    return destination


def unpack(archive: Path, target: Path) -> None:
    if target.exists() and any(target.iterdir()):
        print(f"already unpacked: {target}")
        return
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive, "r:bz2") as tar:
        members = tar.getmembers()
        if not members:
            raise SystemExit(f"archive is empty: {archive}")

        # The release nests everything under a single top-level directory (pyodide/). index.html
        # serves the runtime from the root of vendor/pyodide-core/, so that prefix is stripped
        # here rather than baked into every URL in the page.
        prefix = Path(members[0].name).parts[0]
        if not all(Path(member.name).parts[0] == prefix for member in members):
            raise SystemExit(f"archive does not share one top-level directory: {prefix}")

        for member in members:
            if member.name.startswith(("/", "..")) or ".." in Path(member.name).parts:
                raise SystemExit(f"refusing unsafe archive member: {member.name}")

        tar.extractall(target, members=members, filter="data")
        for member in sorted(target.iterdir()):
            if member.is_dir() and member.name == prefix:
                for child in sorted(member.iterdir()):
                    child.rename(target / child.name)
                member.rmdir()
                break
    print(f"unpacked {len(members)} entries into {target} (top-level directory '{prefix}' flattened)")


def report(target: Path) -> None:
    files = sorted(path for path in target.rglob("*") if path.is_file())
    total = sum(path.stat().st_size for path in files)
    print()
    print(f"release: pyodide-core {VERSION}")
    print(f"files:   {len(files)}")
    print(f"unpacked total: {human(total)} ({total} bytes)")
    print()
    print("largest files:")
    for path in sorted(files, key=lambda item: item.stat().st_size, reverse=True)[:10]:
        size = path.stat().st_size
        print(f"  {human(size):>10}  {path.relative_to(target)}")
    print()
    print("Note: this is the unpacked size of the served assets. Bytes actually transferred over")
    print("the network are measured separately by measure.mjs and are usually smaller, because")
    print("the CDN serves compressed responses.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=DEFAULT_URL, help="archive URL (default: pinned release)")
    parser.add_argument("--skip-download", action="store_true", help="only unpack and report")
    args = parser.parse_args()

    archive = VENDOR / ARCHIVE
    if not args.skip_download:
        download(args.url, archive)
    if not archive.exists():
        raise SystemExit(f"archive missing: {archive} (run without --skip-download)")

    unpack(archive, TARGET)
    report(TARGET)
    return 0


if __name__ == "__main__":
    sys.exit(main())
