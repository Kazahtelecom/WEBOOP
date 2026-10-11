import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LayoutMode = 'split' | 'theory' | 'code';

export interface LayoutStoreState {
  isSidebarOpen: boolean;
  layoutMode: LayoutMode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleRightPanel: () => void;
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
