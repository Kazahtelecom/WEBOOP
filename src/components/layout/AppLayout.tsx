import React, { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLayoutStore } from '../../store/useLayoutStore';
import { PanelLeftOpen } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen);
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar);
  const setLayoutMode = useLayoutStore((state) => state.setLayoutMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем горячие клавиши, если фокус в поле ввода или редакторе
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.classList.contains('cm-content'))
      ) {
        // Исключение: Ctrl+B работает отовсюду
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggleSidebar();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        setLayoutMode('theory');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setLayoutMode('split');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setLayoutMode('code');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, setLayoutMode]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden bg-slate-900 relative">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              title="Развернуть содержание курса (Ctrl+B)"
              aria-label="Развернуть содержание курса"
              className="absolute left-3 top-3 z-30 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800/90 shadow-lg backdrop-blur transition flex items-center space-x-1.5 group"
            >
              <PanelLeftOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium hidden sm:inline">Курс</span>
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

