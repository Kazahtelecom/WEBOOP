import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface HotkeyBindings {
  runTests: string;
  runCode: string;
  toggleSidebar: string;
  modeTheory: string;
  modeSplit: string;
  modeCode: string;
}

export interface SettingsStoreState {
  isSettingsOpen: boolean;
  hotkeys: HotkeyBindings;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  updateHotkey: (action: keyof HotkeyBindings, combination: string) => void;
  resetHotkeys: () => void;
}

export const DEFAULT_HOTKEYS: HotkeyBindings = {
  runTests: 'ctrl+enter',
  runCode: 'ctrl+shift+enter',
  toggleSidebar: 'ctrl+b',
  modeTheory: 'alt+1',
  modeSplit: 'alt+2',
  modeCode: 'alt+3',
};

export const HOTKEY_LABELS: Record<keyof HotkeyBindings, { title: string; description: string }> = {
  runTests: {
    title: 'Запустить проверочные тесты',
    description: 'Выполнить решение и запустить юнит-тесты задачи',
  },
  runCode: {
    title: 'Выполнить код (песочница)',
    description: 'Запустить текущий код без проверочных тестов',
  },
  toggleSidebar: {
    title: 'Скрыть / показать меню курса',
    description: 'Переключить видимость панели содержания',
  },
  modeTheory: {
    title: 'Режим «Чтение»',
    description: 'Развернуть лекцию или условие задачи на весь экран',
  },
  modeSplit: {
    title: 'Режим «Сплит»',
    description: 'Разделить экран пополам: теория слева, код справа',
  },
  modeCode: {
    title: 'Режим «Песочница»',
    description: 'Развернуть редактор кода и терминал на весь экран',
  },
};

const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return memoryStorage[name] ?? null;
      }
    }
    return memoryStorage[name] ?? null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        memoryStorage[name] = value;
      }
    } else {
      memoryStorage[name] = value;
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(name);
      } catch {
        delete memoryStorage[name];
      }
    } else {
      delete memoryStorage[name];
    }
  },
};

/**
 * Проверка соответствия события клавиатуры заданной строке комбинации клавиш (например: "ctrl+enter", "alt+1")
 */
export function matchesHotkey(event: KeyboardEvent, hotkeyStr: string): boolean {
  if (!hotkeyStr) return false;

  const parts = hotkeyStr.toLowerCase().split('+').map((p) => p.trim());
  const hasCtrl = parts.includes('ctrl') || parts.includes('cmd');
  const hasShift = parts.includes('shift');
  const hasAlt = parts.includes('alt');

  const mainKeys = parts.filter(
    (p) => p !== 'ctrl' && p !== 'cmd' && p !== 'shift' && p !== 'alt'
  );
  if (mainKeys.length !== 1) return false;
  const targetKey = mainKeys[0];

  const eventHasCtrl = event.ctrlKey || event.metaKey;
  if (hasCtrl !== eventHasCtrl) return false;
  if (hasShift !== event.shiftKey) return false;
  if (hasAlt !== event.altKey) return false;

  const pressedKey = event.key.toLowerCase();
  return pressedKey === targetKey;
}

/**
 * Преобразование строки комбинации в читаемый список бейджей (например: ["Ctrl", "Enter"])
 */
export function formatHotkeyDisplay(hotkeyStr: string): string[] {
  if (!hotkeyStr) return [];
  return hotkeyStr
    .split('+')
    .map((p) => p.trim())
    .map((p) => {
      const lower = p.toLowerCase();
      if (lower === 'ctrl') return 'Ctrl';
      if (lower === 'cmd') return 'Cmd';
      if (lower === 'shift') return 'Shift';
      if (lower === 'alt') return 'Alt';
      if (lower === 'enter') return 'Enter';
      return p.toUpperCase();
    });
}

/**
 * Захват строкового представления комбинации из KeyboardEvent
 */
export function eventToHotkeyString(event: KeyboardEvent): string | null {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');

  const key = event.key.toLowerCase();
  // Игнорируем нажатия только клавиш-модификаторов
  if (['control', 'meta', 'alt', 'shift'].includes(key)) {
    return null;
  }

  parts.push(key);
  return parts.join('+');
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      isSettingsOpen: false,
      hotkeys: { ...DEFAULT_HOTKEYS },

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      updateHotkey: (action, combination) =>
        set((state) => ({
          hotkeys: {
            ...state.hotkeys,
            [action]: combination.toLowerCase().trim(),
          },
        })),

      resetHotkeys: () =>
        set({
          hotkeys: { ...DEFAULT_HOTKEYS },
        }),
    }),
    {
      name: 'weboop_settings',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
