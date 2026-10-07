/**
 * Drive an installed Chrome or Edge over the Chrome DevTools Protocol and measure what a
 * student actually pays on first load of the Pyodide runtime.
 *
 * No external dependency is used: Node 22+ ships a WebSocket client, so the CDP connection
 * is built from the standard library alone. That matters here because npm does not resolve
 * as a command in this environment (ONB risk R-A), so a puppeteer-style route could not be
 * installed even though it was the first suggestion.
 *
 * Usage:
 *   node measure.mjs [--port 8801] [--url http://127.0.0.1:8801/index.html]
 *                    [--browser auto|path] [--runs 2] [--timeout 120]
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function parseArgs(argv) {
  const options = { port: 8801, url: null, browser: 'auto', runs: 2, timeout: 120 };
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (key === '--port') options.port = Number(value);
    else if (key === '--url') options.url = value;
    else if (key === '--browser') options.browser = value;
    else if (key === '--runs') options.runs = Number(value);
    else if (key === '--timeout') options.timeout = Number(value);
    else throw new Error(`unknown option: ${key}`);
  }
  options.url = options.url ?? `http://127.0.0.1:${options.port}/index.html`;
  return options;
}

function resolveBrowser(choice) {
  if (choice !== 'auto') {
    if (!existsSync(choice)) throw new Error(`browser not found at ${choice}`);
    return choice;
  }
  const found = CANDIDATES.find((path) => existsSync(path));
  if (!found) {
    throw new Error(`no Chrome or Edge found; pass --browser <path>. Tried:\n  ${CANDIDATES.join('\n  ')}`);
  }
  return found;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevtools(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'no attempt made';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return await response.json();
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await sleep(250);
  }
  throw new Error(`DevTools endpoint not reachable on port ${port}: ${lastError}`);
}

/** Minimal CDP session over the built-in WebSocket client. */
class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Set();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`));
        else resolve(message.result);
      } else if (message.method) {
        for (const listener of this.listeners) listener(message);
      }
    });
  }

  static async connect(webSocketUrl, timeoutMs) {
    const socket = new WebSocket(webSocketUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket open timed out')), timeoutMs);
      socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      socket.addEventListener('error', () => { clearTimeout(timer); reject(new Error('WebSocket error')); }, { once: true });
    });
    return new Cdp(socket);
  }

  on(listener) { this.listeners.add(listener); }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
      }, 60_000);
    });
  }

  close() { this.socket.close(); }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? 'page evaluation failed');
  }
  return result.result.value;
}

async function runOnce(cdp, options, runIndex, profileIsFresh) {
  await cdp.send('Network.enable');
  await cdp.send('Page.enable');

  let encodedBytes = 0;
  let decodedBytes = 0;
  const requests = new Map();

  cdp.on((message) => {
    if (message.method === 'Network.responseReceived') {
      requests.set(message.params.requestId, message.params.response.url);
    }
    if (message.method === 'Network.loadingFinished') {
      encodedBytes += message.params.encodedDataLength ?? 0;
    }
    if (message.method === 'Network.dataReceived') {
      decodedBytes += message.params.dataLength ?? 0;
    }
    if (message.method === 'Network.loadingFailed') {
      requests.set(message.params.requestId, `FAILED: ${message.params.errorText}`);
    }
  });

  await cdp.send('Page.navigate', { url: options.url });

  const deadline = Date.now() + options.timeout * 1000;
  let payload = null;
  while (Date.now() < deadline) {
    payload = await evaluate(cdp, 'window.__MEASUREMENT__ ? JSON.parse(JSON.stringify(window.__MEASUREMENT__)) : null');
    if (payload && (payload.done || payload.error)) break;
    await sleep(500);
  }

  if (!payload) throw new Error('the page never published a measurement object');
  if (!payload.done) throw new Error(`measurement did not finish within ${options.timeout}s`);

  return {
    run: runIndex + 1,
    profileIsFresh,
    transferredBytes: encodedBytes,
    decodedBytes,
    loadMs: payload.loadMs,
    initMs: payload.initMs,
    pythonVersion: payload.pythonVersion,
    micropipNeeded: payload.micropipNeeded,
    probeChecks: payload.probeChecks,
    probeOk: payload.probeOk,
    error: payload.error,
    requestCount: requests.size,
  };
}

function formatBytes(count) {
  if (count < 1024) return `${count} B`;
  if (count < 1024 * 1024) return `${(count / 1024).toFixed(1)} KiB`;
  return `${(count / (1024 * 1024)).toFixed(2)} MiB`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const browser = resolveBrowser(options.browser);
  console.log(`browser:  ${browser}`);
  console.log(`target:   ${options.url}`);
  console.log(`runs:     ${options.runs}`);
  console.log();

  const profileBase = await mkdtemp(join(tmpdir(), 'tfw-pyodide-'));
  const runs = [];

  try {
    for (let index = 0; index < options.runs; index += 1) {
      // A fresh profile per run keeps the cache state honest and comparable: without this the
      // second run would silently reuse the first run's downloads.
      const profile = join(profileBase, `profile-${index}`);
      const debugPort = options.port + 1000 + index;
      const child = spawn(browser, [
        '--headless=new',
        `--remote-debugging-port=${debugPort}`,
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-background-networking',
        '--window-size=1280,900',
        'about:blank',
      ], { stdio: 'ignore' });

      try {
        const version = await waitForDevtools(debugPort, 30_000);
        const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
        const page = targets.find((target) => target.type === 'page');
        if (!page) throw new Error('no page target available');

        const cdp = await Cdp.connect(page.webSocketDebuggerUrl, 30_000);
        try {
          const run = await runOnce(cdp, options, index, true);
          run.browser = version.Browser;
          runs.push(run);
          console.log(`run ${run.run}: ${formatBytes(run.transferredBytes)} transferred, ` +
            `load ${run.loadMs} ms, init ${run.initMs} ms, Python ${run.pythonVersion}, ` +
            `probe ${run.probeOk ? 'ok' : 'FAILED'}`);
        } finally {
          cdp.close();
        }
      } catch (error) {
        runs.push({ run: index + 1, error: error.message });
        console.log(`run ${index + 1}: ERROR ${error.message}`);
      } finally {
        child.kill();
        await sleep(500);
      }
    }
  } finally {
    await rm(profileBase, { recursive: true, force: true }).catch(() => {});
  }

  const report = {
    generatedAt: new Date().toISOString(),
    browser,
    target: options.url,
    runs,
  };
  const outFile = join(process.cwd(), 'measurement-report.json');
  await writeFile(outFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log();
  console.log('=== summary ===');
  const usable = runs.filter((run) => !run.error);
  for (const run of runs) {
    if (run.error) { console.log(`run ${run.run}: ERROR ${run.error}`); continue; }
    console.log(`run ${run.run} (${run.browser}, fresh profile):`);
    console.log(`  transferred over network: ${formatBytes(run.transferredBytes)} (${run.transferredBytes} bytes, compressed)`);
    console.log(`  decoded payload:          ${formatBytes(run.decodedBytes)}`);
    console.log(`  load + init:              ${run.loadMs} ms + ${run.initMs} ms`);
    console.log(`  CPython:                  ${run.pythonVersion}`);
    console.log(`  micropip needed:          ${run.micropipNeeded}`);
    const failed = (run.probeChecks ?? []).filter((check) => !check.ok);
    console.log(`  OOP probe:                ${run.probeOk ? 'all checks passed' : `${failed.length} failed`}`);
    for (const check of failed) console.log(`      FAILED ${check.name}: ${JSON.stringify(check.observed)}`);
  }
  console.log();
  console.log(`report written: ${outFile}`);
  if (usable.length === 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`measurement failed: ${error.message}`);
  process.exitCode = 1;
});
