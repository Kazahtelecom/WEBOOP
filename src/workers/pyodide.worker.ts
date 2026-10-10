/// <reference lib="webworker" />
import type { WorkerRequest, WorkerResponse } from '../types/worker';

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
}

let pyodideInstance: PyodideInterface | null = null;
let initPromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const pyodideModuleUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';
    const loader = new Function('url', 'return import(url)') as (url: string) => Promise<{
      loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
    }>;
    const module = await loader(pyodideModuleUrl);
    const pyodide = await module.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return initPromise;
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    if (request.type === 'INIT') {
      const pyodide = await getPyodide();
      const versionResult = pyodide.runPython('import sys; sys.version.split()[0]') as string;
      const response: WorkerResponse = {
        type: 'READY',
        version: String(versionResult || '3.14.x'),
      };
      self.postMessage(response);
      return;
    }

    if (request.type === 'RUN_CODE') {
      const pyodide = await getPyodide();
      const startTime = performance.now();

      // Подготовка скрипта выполнения с перехватом потоков через io.StringIO и json
      const wrapperScript = `
import sys, io, json, traceback

__captured_out = io.StringIO()
__captured_err = io.StringIO()
__old_stdout = sys.stdout
__old_stderr = sys.stderr
sys.stdout = __captured_out
sys.stderr = __captured_err

__error_msg = None
__globals = {"__name__": "__main__"}

try:
    exec(${JSON.stringify(request.payload.code)}, __globals)
except Exception:
    __error_msg = traceback.format_exc()
finally:
    sys.stdout = __old_stdout
    sys.stderr = __old_stderr

json.dumps({
    "output": __captured_out.getvalue(),
    "stderr": __captured_err.getvalue(),
    "error": __error_msg
})
`;
      const rawJson = pyodide.runPython(wrapperScript) as string;
      const parsed = JSON.parse(rawJson) as { output: string; stderr: string; error: string | null };
      const executionTimeMs = Math.round(performance.now() - startTime);

      let fullOutput = parsed.output;
      if (parsed.stderr) {
        fullOutput += (fullOutput ? '\n' : '') + parsed.stderr;
      }
      if (parsed.error) {
        fullOutput += (fullOutput ? '\n' : '') + parsed.error;
      }

      if (parsed.error && !parsed.output) {
        const response: WorkerResponse = {
          type: 'ERROR',
          payload: { message: parsed.error, isTimeout: false },
        };
        self.postMessage(response);
      } else {
        const response: WorkerResponse = {
          type: 'RUN_SUCCESS',
          payload: {
            output: fullOutput || '(Код выполнился без вывода)',
            executionTimeMs,
          },
        };
        self.postMessage(response);
      }
      return;
    }

    if (request.type === 'RUN_TESTS') {
      const pyodide = await getPyodide();
      const startTime = performance.now();

      const wrapperScript = `
import sys, io, json, traceback

__captured_out = io.StringIO()
__captured_err = io.StringIO()
__old_stdout = sys.stdout
__old_stderr = sys.stderr
sys.stdout = __captured_out
sys.stderr = __captured_err

__passed = False
__error_msg = None
__globals = {"__name__": "__main__"}

try:
    exec(${JSON.stringify(request.payload.code)}, __globals)
    exec(${JSON.stringify(request.payload.testCode)}, __globals)
    __passed = True
except AssertionError as ae:
    err_str = str(ae).strip()
    __error_msg = f"AssertionError: {err_str}" if err_str else "AssertionError: Проверка не пройдена"
except Exception:
    __error_msg = traceback.format_exc()
finally:
    sys.stdout = __old_stdout
    sys.stderr = __old_stderr

json.dumps({
    "passed": __passed,
    "output": __captured_out.getvalue(),
    "stderr": __captured_err.getvalue(),
    "error": __error_msg
})
`;
      const rawJson = pyodide.runPython(wrapperScript) as string;
      const parsed = JSON.parse(rawJson) as {
        passed: boolean;
        output: string;
        stderr: string;
        error: string | null;
      };
      const executionTimeMs = Math.round(performance.now() - startTime);

      let fullOutput = parsed.output;
      if (parsed.stderr) {
        fullOutput += (fullOutput ? '\n' : '') + parsed.stderr;
      }

      const response: WorkerResponse = {
        type: 'TEST_RESULTS',
        payload: {
          taskId: request.payload.taskId,
          passed: parsed.passed,
          output: fullOutput,
          executionTimeMs,
          tests: [
            {
              name: 'Автоматические тесты задачи',
              passed: parsed.passed,
              message: parsed.error || 'Все проверки успешно пройдены',
            },
          ],
          error: parsed.error || undefined,
        },
      };
      self.postMessage(response);
      return;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const response: WorkerResponse = {
      type: 'ERROR',
      payload: { message, isTimeout: false },
    };
    self.postMessage(response);
  }
};
