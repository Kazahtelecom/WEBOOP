import React, { useState, useEffect } from 'react';
import {
  useSettingsStore,
  HOTKEY_LABELS,
  formatHotkeyDisplay,
  eventToHotkeyString,
  type HotkeyBindings,
} from '../../store/useSettingsStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { Settings, X, RotateCcw, Keyboard, Columns, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const hotkeys = useSettingsStore((state) => state.hotkeys);
  const updateHotkey = useSettingsStore((state) => state.updateHotkey);
  const resetHotkeys = useSettingsStore((state) => state.resetHotkeys);

  const splitRatio = useLayoutStore((state) => state.splitRatio);
  const editorHeightRatio = useLayoutStore((state) => state.editorHeightRatio);
  const resetSplitRatios = useLayoutStore((state) => state.resetSplitRatios);

  // Какое действие сейчас в режиме записи новой комбинации клавиш
  const [recordingAction, setRecordingAction] = useState<keyof HotkeyBindings | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingAction) return;

    const handleRecordKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecordingAction(null);
        return;
      }

      const combo = eventToHotkeyString(e);
      if (combo) {
        updateHotkey(recordingAction, combo);
        setRecordingAction(null);
        setSaveToast(`Клавиша для «${HOTKEY_LABELS[recordingAction].title}» обновлена!`);
        setTimeout(() => setSaveToast(null), 2500);
      }
    };

    window.addEventListener('keydown', handleRecordKey, true);
    return () => {
      window.removeEventListener('keydown', handleRecordKey, true);
    };
  }, [recordingAction, updateHotkey]);

  if (!isSettingsOpen) return null;

  const hotkeyKeys = Object.keys(hotkeys) as (keyof HotkeyBindings)[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60 select-none">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Настройки платформы</h3>
              <p className="text-[11px] text-slate-400">
                Управление горячими клавишами и поведением интерфейса
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Закрыть настройки (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Уведомление об успешном сохранении */}
        {saveToast && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-2 flex items-center space-x-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Содержимое окна с настройками */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Секция 1: Горячие клавиши */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Горячие клавиши (Shortcuts)</span>
              </div>
              <button
                onClick={resetHotkeys}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-amber-400 transition"
                title="Сбросить все сочетания к исходным"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить клавиши</span>
              </button>
            </div>

            <div className="space-y-2">
              {hotkeyKeys.map((action) => {
                const info = HOTKEY_LABELS[action];
                const isRecording = recordingAction === action;
                const badges = formatHotkeyDisplay(hotkeys[action]);

                return (
                  <div
                    key={action}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between space-x-3 hover:border-slate-700/80 transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200 text-xs">{info.title}</span>
                      <span className="text-[11px] text-slate-400">{info.description}</span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {isRecording ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 text-[11px] font-mono bg-indigo-600/30 text-indigo-300 border border-indigo-500 rounded-md animate-pulse">
                            Нажмите клавиши... (Esc для отмены)
                          </span>
                          <button
                            onClick={() => setRecordingAction(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-200"
                          >
                            Отмена
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-1 font-mono">
                            {badges.map((badge, idx) => (
                              <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-slate-600 text-xs">+</span>}
                                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px] shadow-sm">
                                  {badge}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                          <button
                            onClick={() => setRecordingAction(action)}
                            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition"
                            title="Изменить сочетание клавиш"
                          >
                            Изменить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Секция 2: Размеры панелей и разделители */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold uppercase tracking-wider text-[11px]">
                <Columns className="w-3.5 h-3.5" />
                <span>Пропорции панелей (Сплит)</span>
              </div>
              <button
                onClick={resetSplitRatios}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-amber-400 transition"
                title="Сбросить размеры к 50/50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить размеры</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Ширина сплита (Теория / Код):</span>
                <span className="font-mono text-indigo-300">
                  {Math.round(splitRatio * 100)}% / {Math.round((1 - splitRatio) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Высота правой панели (Редактор / Терминал):</span>
                <span className="font-mono text-indigo-300">
                  {Math.round(editorHeightRatio * 100)}% / {Math.round((1 - editorHeightRatio) * 100)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                💡 Вы можете перетаскивать разделители мышкой прямо на главном экране. Двойной клик
                по разделителю быстро сбрасывает пропорции.
              </p>
            </div>
          </div>
        </div>

        {/* Подвал модального окна */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Настройки сохраняются автоматически в браузере (Local-first)
          </span>
          <button
            onClick={closeSettings}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
