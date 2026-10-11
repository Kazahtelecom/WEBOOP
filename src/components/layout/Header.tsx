import React, { useRef } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import {
  Award,
  Download,
  Upload,
  RotateCcw,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  BookOpen,
  Columns,
  Code2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const currentScore = useCourseStore((state) => state.currentScore);
  const exportProgress = useCourseStore((state) => state.exportProgress);
  const importProgress = useCourseStore((state) => state.importProgress);
  const resetProgress = useCourseStore((state) => state.resetProgress);

  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const layoutMode = useLayoutStore((state) => state.layoutMode);
  const setLayoutMode = useLayoutStore((state) => state.setLayoutMode);
  const toggleRightPanel = useLayoutStore((state) => state.toggleRightPanel);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportProgress();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weboop-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importProgress(content);
        if (success) {
          alert('✅ Прогресс успешно загружен!');
        } else {
          alert('❌ Ошибка: неверный формат файла прогресса.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить весь сохраненный прогресс и баллы?')) {
      resetProgress();
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between select-none">
      <div className="flex items-center space-x-3">
        {/* Кнопка скрытия/показа левого сайдбара */}
        <button
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Свернуть содержание курса (Ctrl+B)' : 'Развернуть содержание курса (Ctrl+B)'}
          aria-label={isSidebarOpen ? 'Свернуть содержание курса' : 'Развернуть содержание курса'}
          className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
            isSidebarOpen
              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 shadow-sm'
          }`}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-100 tracking-tight text-sm">WEBOOP LMS</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-mono border border-slate-700">
              Python 3.14 WASM
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden lg:block">
            Курс объектно-ориентированного программирования
          </p>
        </div>
      </div>

      {/* Переключатель режимов отображения (Чтение / Сплит / Песочница) */}
      <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 space-x-0.5">
        <button
          onClick={() => setLayoutMode('theory')}
          title="Режим «Только чтение лекции» (Alt+1)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
            layoutMode === 'theory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Чтение</span>
        </button>

        <button
          onClick={() => setLayoutMode('split')}
          title="Сплит-режим: лекция + редактор (Alt+2)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
            layoutMode === 'split'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Сплит</span>
        </button>

        <button
          onClick={() => setLayoutMode('code')}
          title="Режим «Песочница»: редактор на весь экран (Alt+3)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
            layoutMode === 'code'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Песочница</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Баллы студента + Прогресс-бар */}
        <div className="flex items-center space-x-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400">Баллы:</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                {currentScore} <span className="text-slate-500 font-normal">/ 100</span>
              </span>
            </div>
            <div className="w-20 sm:w-28 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, currentScore)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Экспорт / Импорт / Сброс */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <button
            onClick={handleExport}
            title="Экспорт прогресса в JSON"
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Экспорт</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Импорт прогресса из JSON"
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Импорт</span>
          </button>

          <button
            onClick={handleReset}
            title="Сбросить прогресс"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Кнопка сворачивания/разворачивания правой панели */}
          <button
            onClick={toggleRightPanel}
            title={layoutMode === 'theory' ? 'Развернуть панель редактора' : 'Свернуть панель редактора (режим чтения)'}
            aria-label={layoutMode === 'theory' ? 'Развернуть панель редактора' : 'Свернуть панель редактора'}
            className={`p-1.5 rounded transition ${
              layoutMode === 'theory'
                ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {layoutMode === 'theory' ? (
              <PanelRightOpen className="w-4 h-4" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
