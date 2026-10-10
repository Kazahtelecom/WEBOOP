import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { TheoryView } from './components/theory/TheoryView';
import { CodeEditor } from './components/editor/CodeEditor';
import { TerminalView } from './components/terminal/TerminalView';
import { useCourseStore } from './store/useCourseStore';
import { demoTask } from './data/demoCourse';
import type { WorkerRequest, WorkerResponse, TestResultItem } from './types/worker';

export const App: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const userSavedCode = useCourseStore((state) => state.userSavedCode);
  const setUserCode = useCourseStore((state) => state.setUserCode);
  const completeTask = useCourseStore((state) => state.completeTask);

  const [runtimeStatus, setRuntimeStatus] = useState<'loading' | 'ready' | 'running' | 'error'>(
    'loading'
  );
  const [runtimeVersion, setRuntimeVersion] = useState<string>('3.14.x');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const [testResults, setTestResults] = useState<
    { passed: boolean; tests: TestResultItem[]; executionTimeMs: number } | undefined
  >();

  const workerRef = useRef<Worker | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Получение актуального кода для текущего шага
  const currentCode =
    userSavedCode[currentStepId] !== undefined
      ? userSavedCode[currentStepId]
      : currentStepId === demoTask.id
      ? demoTask.starterCode
      : '# Введите код для экспериментов в песочнице\n';

  // Инициализация Web Worker с Pyodide
  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setRuntimeStatus('loading');
    const worker = new Worker(new URL('./workers/pyodide.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;

      // Сброс сторожевого таймера при получении ответа
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }

      if (msg.type === 'READY') {
        setRuntimeStatus('ready');
        setRuntimeVersion(msg.version);
        return;
      }

      if (msg.type === 'RUN_SUCCESS') {
        setRuntimeStatus('ready');
        setOutput(msg.payload.output);
        setError(undefined);
        return;
      }

      if (msg.type === 'TEST_RESULTS') {
        setRuntimeStatus('ready');
        setOutput(msg.payload.output);
        setError(msg.payload.error);
        setTestResults({
          passed: msg.payload.passed,
          tests: msg.payload.tests,
          executionTimeMs: msg.payload.executionTimeMs,
        });

        // Начисление баллов при успешном прохождении тестов
        if (msg.payload.passed) {
          completeTask(msg.payload.taskId, demoTask.scorePoints);
        }
        return;
      }

      if (msg.type === 'ERROR') {
        setRuntimeStatus('ready');
        setError(msg.payload.message);
        return;
      }
    };

    worker.onerror = (err) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      setRuntimeStatus('error');
      setError(`Ошибка в Web Worker: ${err.message || 'Неизвестная ошибка'}`);
    };

    workerRef.current = worker;

    // Запуск инициализации Pyodide
    const initMsg: WorkerRequest = { type: 'INIT' };
    worker.postMessage(initMsg);
  }, [completeTask]);

  useEffect(() => {
    initWorker();
    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [initWorker]);

  // Запуск защитного таймера 5 секунд (Watchdog)
  const armWatchdog = () => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
    }
    setRuntimeStatus('running');
    watchdogTimerRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setRuntimeStatus('error');
      setError(
        '⏱️ Превышен лимит времени выполнения (5 секунд)! Процесс принудительно прерван для защиты от зависания страницы (вероятен бесконечный цикл).'
      );
      // Автоматический перезапуск нового экземпляра воркера
      initWorker();
    }, 5000);
  };

  const handleRunCode = () => {
    if (!workerRef.current || runtimeStatus !== 'ready') return;
    setError(undefined);
    setTestResults(undefined);
    armWatchdog();

    const msg: WorkerRequest = {
      type: 'RUN_CODE',
      payload: { code: currentCode },
    };
    workerRef.current.postMessage(msg);
  };

  const handleRunTests = () => {
    if (!workerRef.current || runtimeStatus !== 'ready') return;
    setError(undefined);
    setTestResults(undefined);
    armWatchdog();

    const msg: WorkerRequest = {
      type: 'RUN_TESTS',
      payload: {
        code: currentCode,
        testCode: demoTask.testCode,
        taskId: demoTask.id,
      },
    };
    workerRef.current.postMessage(msg);
  };

  const handleResetCode = () => {
    if (confirm('Сбросить текущий код к исходному шаблону задачи?')) {
      if (currentStepId === demoTask.id) {
        setUserCode(demoTask.id, demoTask.starterCode);
      } else {
        setUserCode(currentStepId, '');
      }
    }
  };

  const handleClearTerminal = () => {
    setOutput('');
    setError(undefined);
    setTestResults(undefined);
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Левая панель: Теория / Условие задачи */}
        <div className="w-full md:w-1/2 border-r border-slate-800 overflow-hidden flex flex-col">
          <TheoryView />
        </div>

        {/* Правая панель: Редактор кода + Терминал (вертикальный сплит) */}
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
          {/* Редактор кода (60% высоты) */}
          <div className="h-3/5 overflow-hidden">
            <CodeEditor
              code={currentCode}
              onChange={(val) => setUserCode(currentStepId, val)}
              onRunCode={handleRunCode}
              onRunTests={handleRunTests}
              onResetCode={handleResetCode}
              isRunning={runtimeStatus === 'running'}
              isReady={runtimeStatus === 'ready'}
            />
          </div>

          {/* Терминал вывода и тестов (40% высоты) */}
          <div className="h-2/5 overflow-hidden">
            <TerminalView
              runtimeStatus={runtimeStatus}
              runtimeVersion={runtimeVersion}
              output={output}
              error={error}
              testResults={testResults}
              onClear={handleClearTerminal}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default App;
