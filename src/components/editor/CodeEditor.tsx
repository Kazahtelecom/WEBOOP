import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Play, CheckCircle, RotateCcw } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRunCode: () => void;
  onRunTests: () => void;
  onResetCode: () => void;
  isRunning: boolean;
  isReady: boolean;
  hasTests?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRunCode,
  onRunTests,
  onResetCode,
  isRunning,
  isReady,
  hasTests = true,
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Панель действий редактора */}
      <div className="h-10 bg-slate-900 px-3 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300">Редактор решения</span>
          <span className="text-[10px] text-slate-500 font-mono">Python 3.14</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetCode}
            title="Сбросить код к начальному шаблону"
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сбросить</span>
          </button>

          {/* Запуск чистого кода */}
          <button
            onClick={onRunCode}
            disabled={isRunning || !isReady}
            title="Выполнить код и просмотреть вывод"
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded font-medium transition ${
              isRunning || !isReady
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Запустить</span>
          </button>

          {/* Проверка тестов (только если у шага есть тесты) */}
          {hasTests ? (
            <button
              onClick={onRunTests}
              disabled={isRunning || !isReady}
              title="Запустить проверочные автотесты задачи"
              className={`flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded font-medium shadow-sm transition ${
                isRunning || !isReady
                  ? 'bg-indigo-900/50 text-indigo-400/50 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Проверить тесты</span>
            </button>
          ) : (
            <div
              title="В лекциях нет проверочных тестов. Вы можете свободно экспериментировать в песочнице."
              className="text-[11px] text-slate-500 bg-slate-900/60 border border-slate-800 px-2 py-1 rounded select-none hidden md:block"
            >
              Песочница теории
            </div>
          )}
        </div>
      </div>

      {/* Сам CodeMirror редактор */}
      <div className="flex-1 overflow-auto bg-[#282c34] text-sm">
        <CodeMirror
          value={code}
          height="100%"
          theme="dark"
          extensions={[python()]}
          onChange={onChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  );
};
