import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { TestResultItem } from '../../types/worker';

interface TerminalViewProps {
  runtimeStatus: 'loading' | 'ready' | 'running' | 'error';
  runtimeVersion: string;
  output: string;
  error?: string;
  testResults?: {
    passed: boolean;
    tests: TestResultItem[];
    executionTimeMs: number;
  };
  onClear: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  runtimeStatus,
  runtimeVersion,
  output,
  error,
  testResults,
  onClear,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, error, testResults]);

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono text-xs border-t border-slate-800">
      {/* Шапка терминала */}
      <div className="h-8 bg-slate-900/80 px-3 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-300">Терминал вывода</span>

          {/* Статус Pyodide */}
          <div className="flex items-center space-x-1.5 ml-3">
            <span
              className={`w-2 h-2 rounded-full ${
                runtimeStatus === 'ready'
                  ? 'bg-emerald-500'
                  : runtimeStatus === 'running'
                  ? 'bg-amber-400 animate-pulse'
                  : runtimeStatus === 'loading'
                  ? 'bg-indigo-400 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-[11px] text-slate-400">
              {runtimeStatus === 'ready' && `Pyodide ${runtimeVersion} готов`}
              {runtimeStatus === 'loading' && 'Загрузка WASM рантайма...'}
              {runtimeStatus === 'running' && 'Выполнение кода...'}
              {runtimeStatus === 'error' && 'Ошибка рантайма'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {testResults && (
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mr-2">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{testResults.executionTimeMs} мс</span>
            </div>
          )}

          <button
            onClick={onClear}
            title="Очистить терминал"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Тело терминала */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {/* Результат тестов если есть */}
        {testResults && (
          <div
            className={`p-2.5 rounded border ${
              testResults.passed
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/30 border-red-800/60 text-red-300'
            }`}
          >
            <div className="flex items-center space-x-2 font-semibold">
              {testResults.passed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>[OK] Все тесты пройдены! Баллы начислены.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>[FAIL] Проверочные тесты не пройдены.</span>
                </>
              )}
            </div>

            {testResults.tests.map((t, idx) => (
              <div key={idx} className="mt-1 pl-6 text-[11px] text-slate-300">
                • {t.name}: {t.message}
              </div>
            ))}
          </div>
        )}

        {/* Вывод stdout/stderr */}
        {output ? (
          <pre className="whitespace-pre-wrap leading-relaxed text-slate-200">{output}</pre>
        ) : (
          !testResults && (
            <div className="text-slate-600 italic">
              Нажмите «Запустить код» или «Проверить тесты» для вывода результатов.
            </div>
          )
        )}

        {/* Ошибки выполнения */}
        {error && (
          <div className="p-2.5 rounded bg-red-950/40 border border-red-900/60 text-red-300 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
