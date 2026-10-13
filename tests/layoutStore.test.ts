import { describe, it, expect, beforeEach } from 'vitest';
import { useLayoutStore } from '../src/store/useLayoutStore';

describe('useLayoutStore (Collapsible Sidebars and Layout Modes)', () => {
  beforeEach(() => {
    useLayoutStore.getState().resetLayout();
  });

  it('инициализируется с открытым сайдбаром и сплит-режимом (50/50)', () => {
    const state = useLayoutStore.getState();
    expect(state.isSidebarOpen).toBe(true);
    expect(state.layoutMode).toBe('split');
  });

  it('корректно переключает видимость левого сайдбара toggleSidebar', () => {
    useLayoutStore.getState().toggleSidebar();
    expect(useLayoutStore.getState().isSidebarOpen).toBe(false);

    useLayoutStore.getState().toggleSidebar();
    expect(useLayoutStore.getState().isSidebarOpen).toBe(true);
  });

  it('позволяет явно задать видимость левого сайдбара setSidebarOpen', () => {
    useLayoutStore.getState().setSidebarOpen(false);
    expect(useLayoutStore.getState().isSidebarOpen).toBe(false);

    useLayoutStore.getState().setSidebarOpen(true);
    expect(useLayoutStore.getState().isSidebarOpen).toBe(true);
  });

  it('корректно переключает режимы отображения (чтение, сплит, песочница)', () => {
    useLayoutStore.getState().setLayoutMode('theory');
    expect(useLayoutStore.getState().layoutMode).toBe('theory');

    useLayoutStore.getState().setLayoutMode('code');
    expect(useLayoutStore.getState().layoutMode).toBe('code');

    useLayoutStore.getState().setLayoutMode('split');
    expect(useLayoutStore.getState().layoutMode).toBe('split');
  });

  it('toggleRightPanel сворачивает правую панель в режим чтения и возвращает обратно в сплит', () => {
    expect(useLayoutStore.getState().layoutMode).toBe('split');

    // Клик по сворачиванию правой панели переключает в режим "только чтение"
    useLayoutStore.getState().toggleRightPanel();
    expect(useLayoutStore.getState().layoutMode).toBe('theory');

    // Повторный клик разворачивает правую панель обратно в сплит
    useLayoutStore.getState().toggleRightPanel();
    expect(useLayoutStore.getState().layoutMode).toBe('split');
  });

  it('сбрасывает состояние layout к значениям по умолчанию через resetLayout', () => {
    useLayoutStore.getState().setSidebarOpen(false);
    useLayoutStore.getState().setLayoutMode('code');
    useLayoutStore.getState().setSplitRatio(0.7);
    useLayoutStore.getState().setEditorHeightRatio(0.3);

    useLayoutStore.getState().resetLayout();
    const state = useLayoutStore.getState();
    expect(state.isSidebarOpen).toBe(true);
    expect(state.layoutMode).toBe('split');
    expect(state.splitRatio).toBe(0.5);
    expect(state.editorHeightRatio).toBe(0.6);
  });

  it('корректно обновляет и ограничивает пропорции сплита setSplitRatio', () => {
    // В допустимых пределах 0.2 - 0.8
    useLayoutStore.getState().setSplitRatio(0.35);
    expect(useLayoutStore.getState().splitRatio).toBe(0.35);

    // Ограничение снизу (минимум 0.2)
    useLayoutStore.getState().setSplitRatio(0.05);
    expect(useLayoutStore.getState().splitRatio).toBe(0.2);

    // Ограничение сверху (максимум 0.8)
    useLayoutStore.getState().setSplitRatio(0.95);
    expect(useLayoutStore.getState().splitRatio).toBe(0.8);
  });

  it('корректно обновляет и ограничивает высоту редактора setEditorHeightRatio', () => {
    // В пределах 0.2 - 0.85
    useLayoutStore.getState().setEditorHeightRatio(0.75);
    expect(useLayoutStore.getState().editorHeightRatio).toBe(0.75);

    // Ограничение снизу (минимум 0.2)
    useLayoutStore.getState().setEditorHeightRatio(0.1);
    expect(useLayoutStore.getState().editorHeightRatio).toBe(0.2);

    // Ограничение сверху (максимум 0.85)
    useLayoutStore.getState().setEditorHeightRatio(0.99);
    expect(useLayoutStore.getState().editorHeightRatio).toBe(0.85);
  });

  it('сбрасывает пропорции панелей к дефолтным значениям через resetSplitRatios', () => {
    useLayoutStore.getState().setSplitRatio(0.75);
    useLayoutStore.getState().setEditorHeightRatio(0.3);

    useLayoutStore.getState().resetSplitRatios();
    expect(useLayoutStore.getState().splitRatio).toBe(0.5);
    expect(useLayoutStore.getState().editorHeightRatio).toBe(0.6);
  });
});
