import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LayoutMode = 'split' | 'theory' | 'code';

export interface LayoutStoreState {
  isSidebarOpen: boolean;
  layoutMode: LayoutMode;
  splitRatio: number;
  editorHeightRatio: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleRightPanel: () => void;
  setSplitRatio: (ratio: number) => void;
  setEditorHeightRatio: (ratio: number) => void;
  resetSplitRatios: () => void;
  resetLayout: () => void;
}

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
 * Оповещение подписчиков (включая CodeMirror) об изменении размеров контейнеров.
 * Вызывается немедленно и по завершении CSS-анимации (300мс).
 */
export const notifyLayoutResize = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320);
  }
};

const DEFAULT_LAYOUT_STATE = {
  isSidebarOpen: true,
  layoutMode: 'split' as LayoutMode,
  splitRatio: 0.5,
  editorHeightRatio: 0.6,
};

export const useLayoutStore = create<LayoutStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_LAYOUT_STATE,

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        notifyLayoutResize();
      },

      setSidebarOpen: (open: boolean) => {
        set({ isSidebarOpen: open });
        notifyLayoutResize();
      },

      setLayoutMode: (mode: LayoutMode) => {
        set({ layoutMode: mode });
        notifyLayoutResize();
      },

      toggleRightPanel: () => {
        const currentMode = get().layoutMode;
        if (currentMode === 'theory') {
          // Если правая панель была скрыта — возвращаем сплит
          set({ layoutMode: 'split' });
        } else {
          // Если правая панель была видна (в сплите или режиме кода) — скрываем её в режим чтения
          set({ layoutMode: 'theory' });
        }
        notifyLayoutResize();
      },

      setSplitRatio: (ratio: number) => {
        const clamped = Math.min(0.8, Math.max(0.2, ratio));
        set({ splitRatio: clamped });
        notifyLayoutResize();
      },

      setEditorHeightRatio: (ratio: number) => {
        const clamped = Math.min(0.85, Math.max(0.2, ratio));
        set({ editorHeightRatio: clamped });
        notifyLayoutResize();
      },

      resetSplitRatios: () => {
        set({
          splitRatio: DEFAULT_LAYOUT_STATE.splitRatio,
          editorHeightRatio: DEFAULT_LAYOUT_STATE.editorHeightRatio,
        });
        notifyLayoutResize();
      },

      resetLayout: () => {
        set({ ...DEFAULT_LAYOUT_STATE });
        notifyLayoutResize();
      },
    }),
    {
      name: 'weboop_ui_layout',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
