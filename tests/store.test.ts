import { describe, it, expect, beforeEach } from 'vitest';
import { useCourseStore } from '../src/store/useCourseStore';

describe('useCourseStore (Zustand & LocalStorage persistence)', () => {
  beforeEach(() => {
    useCourseStore.getState().resetProgress();
  });

  it('инициализируется с нулевыми баллами и пустым состоянием задач', () => {
    const state = useCourseStore.getState();
    expect(state.currentScore).toBe(0);
    expect(state.currentStepId).toBe('week-1-lecture');
    expect(state.completedTasks).toEqual({});
    expect(state.userSavedCode).toEqual({});
    expect(state.isExamUnlocked).toBe(false);
  });

  it('сохраняет набранный студентом код по идентификатору задачи', () => {
    const testCode = 'class Counter:\n    pass';
    useCourseStore.getState().setUserCode('demo-task-1', testCode);

    const updated = useCourseStore.getState();
    expect(updated.userSavedCode['demo-task-1']).toBe(testCode);
  });

  it('начисляет баллы за успешное решение задачи и предотвращает повторное начисление', () => {
    useCourseStore.getState().completeTask('demo-task-1', 10);

    let state = useCourseStore.getState();
    expect(state.currentScore).toBe(10);
    expect(state.completedTasks['demo-task-1']).toBe(true);

    // Повторный вызов не должен дублировать баллы
    useCourseStore.getState().completeTask('demo-task-1', 10);
    state = useCourseStore.getState();
    expect(state.currentScore).toBe(10);
  });

  it('корректно экспортирует прогресс в валидный JSON', () => {
    useCourseStore.getState().setUserCode('task-1', 'x = 10');
    useCourseStore.getState().completeTask('task-1', 15);

    const jsonStr = useCourseStore.getState().exportProgress();
    const parsed = JSON.parse(jsonStr) as {
      currentScore: number;
      completedTasks: Record<string, boolean>;
      userSavedCode: Record<string, string>;
    };

    expect(parsed.currentScore).toBe(15);
    expect(parsed.completedTasks['task-1']).toBe(true);
    expect(parsed.userSavedCode['task-1']).toBe('x = 10');
  });

  it('корректно импортирует прогресс из JSON строки', () => {
    const backup = {
      currentScore: 25,
      currentStepId: 'demo-task-1',
      completedTasks: { 'demo-task-1': true },
      userSavedCode: { 'demo-task-1': 'class Counter:\n    def inc(self): pass' },
      isExamUnlocked: false,
      isExamCompleted: false,
      lastUpdatedIso: new Date().toISOString(),
    };

    const success = useCourseStore.getState().importProgress(JSON.stringify(backup));
    expect(success).toBe(true);

    const state = useCourseStore.getState();
    expect(state.currentScore).toBe(25);
    expect(state.completedTasks['demo-task-1']).toBe(true);
    expect(state.userSavedCode['demo-task-1']).toContain('class Counter');
  });

  it('отклоняет некорректный JSON при импорте', () => {
    const invalidSuccess = useCourseStore.getState().importProgress('{ invalid json');
    expect(invalidSuccess).toBe(false);
  });

  it('разблокирует экзамен при достижении 75 баллов и отмечает его завершение', () => {
    useCourseStore.getState().completeTask('w1-p', 25);
    useCourseStore.getState().completeTask('w2-p', 25);
    expect(useCourseStore.getState().isExamUnlocked).toBe(false);

    useCourseStore.getState().completeTask('w3-p', 25);
    const unlockedState = useCourseStore.getState();
    expect(unlockedState.currentScore).toBe(75);
    expect(unlockedState.isExamUnlocked).toBe(true);
    expect(unlockedState.isExamCompleted).toBe(false);

    // Сдача финального экзамена
    useCourseStore.getState().completeTask('final-exam', 25);
    const completedState = useCourseStore.getState();
    expect(completedState.currentScore).toBe(100);
    expect(completedState.isExamCompleted).toBe(true);
  });
});
