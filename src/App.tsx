import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { TheoryView } from './components/theory/TheoryView';
import { CodeEditor } from './components/editor/CodeEditor';
import { TerminalView } from './components/terminal/TerminalView';
import { useCourseStore } from './store/useCourseStore';
import { useLayoutStore, notifyLayoutResize } from './store/useLayoutStore';
import { useSettingsStore, matchesHotkey } from './store/useSettingsStore';
import { getCourseItemById } from './data/courseData';
import type { WorkerRequest, WorkerResponse, TestResultItem } from './types/worker';
import type { CodeTask } from './types/course';

export const App: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const userSavedCode = useCourseStore((state) => state.userSavedCode);
  const setUserCode = useCourseStore((state) => state.setUserCode);
  const completeTask = useCourseStore((state) => state.completeTask);

  const layoutMode = useLayoutStore((state) => state.layoutMode);
  const setLayoutMode = useLayoutStore((state) => state.setLayoutMode);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const splitRatio = useLayoutStore((state) => state.splitRatio);
  const setSplitRatio = useLayoutStore((state) => state.setSplitRatio);
  const editorHeightRatio = useLayoutStore((state) => state.editorHeightRatio);
  const setEditorHeightRatio = useLayoutStore((state) => state.setEditorHeightRatio);
  const resetSplitRatios = useLayoutStore((state) => state.resetSplitRatios);

  const hotkeys = useSettingsStore((state) => state.hotkeys);
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const closeSettings = useSettingsStore((state) => state.closeSettings);

  const [runtimeStatus, setRuntimeStatus] = useState<'loading' | 'ready' | 'running' | 'error'>(
    'loading'
  );
  const [runtimeVersion, setRuntimeVersion] = useState<string>('3.14.x');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | undefined>();
  const [testResults, setTestResults] = useState<
    { passed: boolean; tests: TestResultItem[]; executionTimeMs: number } | undefined
  >();

  const [isDraggingH, setIsDraggingH] = useState(false);
  const [isDraggingV, setIsDraggingV] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Определение активного элемента курса
  const resolvedItem = getCourseItemById(currentStepId);
  let activeTask: CodeTask | null = null;

  if (resolvedItem?.type === 'task') {
    activeTask = resolvedItem.task;
  }

  // Получение актуального кода для текущего шага
  const currentCode =
    userSavedCode[currentStepId] !== undefined
      ? userSavedCode[currentStepId]
      : activeTask
      ? activeTask.starterCode
      : '# Интерактивная песочница для экспериментов с кодом лекции\nfrom decimal import Decimal\n\n';

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
          const item = getCourseItemById(msg.payload.taskId);
          if (item?.type === 'task') {
            completeTask(msg.payload.taskId, item.task.scorePoints);
          }
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
  const armWatchdog = useCallback(() => {
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
  }, [initWorker]);

  const handleRunCode = useCallback(() => {
    if (!workerRef.current || runtimeStatus !== 'ready') return;
    setError(undefined);
    setTestResults(undefined);
    armWatchdog();

    const msg: WorkerRequest = {
      type: 'RUN_CODE',
      payload: { code: currentCode },
    };
    workerRef.current.postMessage(msg);
  }, [runtimeStatus, armWatchdog, currentCode]);

  const handleRunTests = useCallback(() => {
    if (!workerRef.current || runtimeStatus !== 'ready') return;

    if (!activeTask || !activeTask.testCode) {
      handleRunCode();
      return;
    }

    setError(undefined);
    setTestResults(undefined);
    armWatchdog();

    const msg: WorkerRequest = {
      type: 'RUN_TESTS',
      payload: {
        code: currentCode,
        testCode: activeTask.testCode,
        taskId: activeTask.id,
      },
    };
    workerRef.current.postMessage(msg);
  }, [runtimeStatus, activeTask, handleRunCode, armWatchdog, currentCode]);

  const handleResetCode = () => {
    if (confirm('Сбросить текущий код к исходному шаблону задания?')) {
      if (activeTask) {
        setUserCode(activeTask.id, activeTask.starterCode);
      } else {
        setUserCode(
          currentStepId,
          '# Интерактивная песочница для экспериментов с кодом лекции\nfrom decimal import Decimal\n\n'
        );
      }
    }
  };

  const handleClearTerminal = () => {
    setOutput('');
    setError(undefined);
    setTestResults(undefined);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === 'width' || e.propertyName === 'flex-basis') {
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Обработка горизонтального перетаскивания сплита (Теория / Код)
  useEffect(() => {
    if (!isDraggingH) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!mainContainerRef.current) return;
      const rect = mainContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (e.clientX - rect.left) / rect.width;
      setSplitRatio(ratio);
    };

    const handleMouseUp = () => {
      setIsDraggingH(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      notifyLayoutResize();
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingH, setSplitRatio]);

  // Обработка вертикального перетаскивания (Редактор / Терминал)
  useEffect(() => {
    if (!isDraggingV) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      if (rect.height <= 0) return;
      const ratio = (e.clientY - rect.top) / rect.height;
      setEditorHeightRatio(ratio);
    };

    const handleMouseUp = () => {
      setIsDraggingV(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      notifyLayoutResize();
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingV, setEditorHeightRatio]);

  // Глобальная обработка горячих клавиш (включая события внутри CodeMirror)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
        return;
      }

      if (matchesHotkey(e, hotkeys.runTests)) {
        e.preventDefault();
        handleRunTests();
        return;
      }

      if (matchesHotkey(e, hotkeys.runCode)) {
        e.preventDefault();
        handleRunCode();
        return;
      }

      if (matchesHotkey(e, hotkeys.toggleSidebar)) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (matchesHotkey(e, hotkeys.modeTheory)) {
        e.preventDefault();
        setLayoutMode('theory');
        return;
      }

      if (matchesHotkey(e, hotkeys.modeSplit)) {
        e.preventDefault();
        setLayoutMode('split');
        return;
      }

      if (matchesHotkey(e, hotkeys.modeCode)) {
        e.preventDefault();
        setLayoutMode('code');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [
    hotkeys,
    isSettingsOpen,
    closeSettings,
    handleRunTests,
    handleRunCode,
    toggleSidebar,
    setLayoutMode,
  ]);

  return (
    <AppLayout>
      <div
        ref={mainContainerRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full"
      >
        {/* Левая панель: Теория / Условие задачи */}
        <div
          onTransitionEnd={handleTransitionEnd}
          style={layoutMode === 'split' ? { width: `${splitRatio * 100}%` } : undefined}
          className={`min-w-0 overflow-hidden flex flex-col ${
            isDraggingH ? '' : 'transition-all duration-300 ease-in-out'
          } ${
            layoutMode === 'code'
              ? 'w-0 opacity-0 pointer-events-none'
              : layoutMode === 'theory'
              ? 'w-full flex-1 border-r-0'
              : 'w-full'
          }`}
        >
          <div className="h-full w-full flex flex-col overflow-hidden">
            <TheoryView />
          </div>
        </div>

        {/* Перетаскиваемый разделитель между теорией и редактором (в сплит-режиме) */}
        {layoutMode === 'split' && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingH(true);
            }}
            onDoubleClick={resetSplitRatios}
            title="Потяните для изменения ширины (двойной клик — 50/50)"
            className={`hidden md:flex w-2.5 hover:w-2.5 bg-slate-950 hover:bg-indigo-600/60 cursor-col-resize items-center justify-center transition-colors relative z-20 select-none group border-x border-slate-800 ${
              isDraggingH ? 'bg-indigo-600 !w-2.5' : ''
            }`}
          >
            <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
          </div>
        )}

        {/* Правая панель: Редактор кода + Терминал (вертикальный сплит) */}
        <div
          ref={rightPanelRef}
          onTransitionEnd={handleTransitionEnd}
          style={layoutMode === 'split' ? { width: `${(1 - splitRatio) * 100}%` } : undefined}
          className={`min-w-0 overflow-hidden flex flex-col ${
            isDraggingH ? '' : 'transition-all duration-300 ease-in-out'
          } ${
            layoutMode === 'theory'
              ? 'w-0 opacity-0 pointer-events-none'
              : layoutMode === 'code'
              ? 'w-full flex-1'
              : 'w-full flex-1'
          }`}
        >
          <div className="h-full w-full flex flex-col overflow-hidden">
            {/* Редактор кода */}
            <div
              style={{ height: `${editorHeightRatio * 100}%` }}
              className="overflow-hidden min-h-[120px]"
            >
              <CodeEditor
                code={currentCode}
                onChange={(val) => setUserCode(currentStepId, val)}
                onRunCode={handleRunCode}
                onRunTests={handleRunTests}
                onResetCode={handleResetCode}
                isRunning={runtimeStatus === 'running'}
                isReady={runtimeStatus === 'ready'}
                hasTests={Boolean(activeTask?.testCode)}
              />
            </div>

            {/* Перетаскиваемый разделитель между редактором и терминалом */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingV(true);
              }}
              onDoubleClick={() => setEditorHeightRatio(0.6)}
              title="Потяните для изменения высоты терминала (двойной клик — 60/40)"
              className={`h-2 hover:h-2 bg-slate-950 hover:bg-indigo-600/60 cursor-row-resize flex items-center justify-center transition-colors relative z-20 select-none group border-y border-slate-800 ${
                isDraggingV ? 'bg-indigo-600 !h-2' : ''
              }`}
            >
              <div className="h-0.5 w-8 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
            </div>

            {/* Терминал вывода и тестов */}
            <div
              style={{ height: `${(1 - editorHeightRatio) * 100}%` }}
              className="overflow-hidden min-h-[80px]"
            >
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
      </div>
    </AppLayout>
  );
};

export default App;
