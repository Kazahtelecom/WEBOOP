import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSettingsStore,
  matchesHotkey,
  formatHotkeyDisplay,
  eventToHotkeyString,
  DEFAULT_HOTKEYS,
} from '../src/store/useSettingsStore';

describe('useSettingsStore (Platform Settings & Hotkeys)', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      isSettingsOpen: false,
      hotkeys: { ...DEFAULT_HOTKEYS },
    });
  });

  it('инициализируется с дефолтными горячими клавишами и закрытым окном', () => {
    const state = useSettingsStore.getState();
    expect(state.isSettingsOpen).toBe(false);
    expect(state.hotkeys.runTests).toBe('ctrl+enter');
    expect(state.hotkeys.runCode).toBe('ctrl+shift+enter');
    expect(state.hotkeys.toggleSidebar).toBe('ctrl+b');
    expect(state.hotkeys.modeTheory).toBe('alt+1');
    expect(state.hotkeys.modeSplit).toBe('alt+2');
    expect(state.hotkeys.modeCode).toBe('alt+3');
  });

  it('открывает, закрывает и переключает окно настроек', () => {
    useSettingsStore.getState().openSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(true);

    useSettingsStore.getState().closeSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(false);

    useSettingsStore.getState().toggleSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(true);

    useSettingsStore.getState().toggleSettings();
    expect(useSettingsStore.getState().isSettingsOpen).toBe(false);
  });

  it('позволяет обновить конкретную комбинацию горячих клавиш updateHotkey', () => {
    useSettingsStore.getState().updateHotkey('runTests', 'ctrl+r');
    expect(useSettingsStore.getState().hotkeys.runTests).toBe('ctrl+r');

    // Остальные клавиши остаются без изменений
    expect(useSettingsStore.getState().hotkeys.runCode).toBe('ctrl+shift+enter');
  });

  it('сбрасывает все горячие клавиши к исходным значениям через resetHotkeys', () => {
    useSettingsStore.getState().updateHotkey('runTests', 'ctrl+alt+t');
    useSettingsStore.getState().updateHotkey('toggleSidebar', 'f1');

    useSettingsStore.getState().resetHotkeys();
    expect(useSettingsStore.getState().hotkeys.runTests).toBe('ctrl+enter');
    expect(useSettingsStore.getState().hotkeys.toggleSidebar).toBe('ctrl+b');
  });
});

describe('matchesHotkey helper', () => {
  it('распознает Ctrl+Enter и Cmd+Enter', () => {
    const fakeCtrlEnter = {
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      key: 'Enter',
    } as KeyboardEvent;

    expect(matchesHotkey(fakeCtrlEnter, 'ctrl+enter')).toBe(true);
    expect(matchesHotkey(fakeCtrlEnter, 'ctrl+shift+enter')).toBe(false);

    const fakeMetaEnter = {
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: true,
      key: 'Enter',
    } as KeyboardEvent;

    expect(matchesHotkey(fakeMetaEnter, 'ctrl+enter')).toBe(true);
  });

  it('распознает комбинации с Shift (Ctrl+Shift+Enter)', () => {
    const fakeCtrlShiftEnter = {
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      key: 'Enter',
    } as KeyboardEvent;

    expect(matchesHotkey(fakeCtrlShiftEnter, 'ctrl+shift+enter')).toBe(true);
    expect(matchesHotkey(fakeCtrlShiftEnter, 'ctrl+enter')).toBe(false);
  });

  it('распознает Alt+цифры (Alt+1, Alt+2, Alt+3)', () => {
    const fakeAlt1 = {
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      metaKey: false,
      key: '1',
    } as KeyboardEvent;

    expect(matchesHotkey(fakeAlt1, 'alt+1')).toBe(true);
    expect(matchesHotkey(fakeAlt1, 'alt+2')).toBe(false);
    expect(matchesHotkey(fakeAlt1, 'ctrl+1')).toBe(false);
  });
});

describe('formatHotkeyDisplay & eventToHotkeyString helpers', () => {
  it('форматирует строку сочетания в аккуратные метки бейджей', () => {
    expect(formatHotkeyDisplay('ctrl+enter')).toEqual(['Ctrl', 'Enter']);
    expect(formatHotkeyDisplay('ctrl+shift+enter')).toEqual(['Ctrl', 'Shift', 'Enter']);
    expect(formatHotkeyDisplay('alt+1')).toEqual(['Alt', '1']);
  });

  it('преобразует событие клавиатуры в нормализованную строку eventToHotkeyString', () => {
    const fakeEvent = {
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      key: 'Enter',
    } as KeyboardEvent;

    expect(eventToHotkeyString(fakeEvent)).toBe('ctrl+enter');

    // При нажатии только клавиши-модификатора возвращает null
    const modifierOnly = {
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      key: 'Control',
    } as KeyboardEvent;

    expect(eventToHotkeyString(modifierOnly)).toBeNull();
  });
});
