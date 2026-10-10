import { describe, it, expect } from 'vitest';
import type {
  Course,
  WeekModule,
  Lesson,
  CodeTask,
  InteractiveCheck,
  StudentProgressState,
} from '../src/types/course';
import type { WorkerRequest, WorkerResponse } from '../src/types/worker';
import { demoCourse, demoLesson, demoTask } from '../src/data/demoCourse';

describe('Domain Model & Worker Protocol Type Verification (No Any)', () => {
  it('демо-курс demoCourse строго соответствует интерфейсу Course', () => {
    const course: Course = demoCourse;
    expect(course.id).toBeDefined();
    expect(course.title).toBeTypeOf('string');
    expect(course.totalMaxScore).toBe(100);
    expect(course.weeks.length).toBeGreaterThan(0);
  });

  it('демо-лекция demoLesson строго соответствует интерфейсу Lesson', () => {
    const lesson: Lesson = demoLesson;
    expect(lesson.id).toBe('demo-intro');
    expect(lesson.durationMinutes).toBe(10);
    expect(lesson.contentMarkdown.length).toBeGreaterThan(0);
    expect(lesson.quickChecks.length).toBeGreaterThan(0);

    const check: InteractiveCheck = lesson.quickChecks[0];
    expect(check.options.length).toBe(4);
    expect(check.correctOptionIndex).toBe(1);
  });

  it('демо-задача demoTask строго соответствует интерфейсу CodeTask', () => {
    const task: CodeTask = demoTask;
    expect(task.id).toBe('demo-task-1');
    expect(task.scorePoints).toBe(10);
    expect(task.starterCode).toContain('class Counter:');
    expect(task.testCode).toContain('assert');
  });

  it('недели курса соответствуют интерфейсу WeekModule', () => {
    const week: WeekModule = demoCourse.weeks[0];
    expect(week.weekNumber).toBe(1);
    expect(week.maxScore).toBe(10);
    expect(week.practiceTasks.length).toBe(1);
    expect(week.homeworkTask).toBeDefined();
  });

  it('протокол сообщений воркера WorkerRequest и WorkerResponse формирует корректный discriminated union', () => {
    const initReq: WorkerRequest = { type: 'INIT' };
    const runReq: WorkerRequest = { type: 'RUN_CODE', payload: { code: 'print(1)' } };
    const testReq: WorkerRequest = {
      type: 'RUN_TESTS',
      payload: { code: 'x = 1', testCode: 'assert x == 1', taskId: 't1' },
    };

    expect(initReq.type).toBe('INIT');
    expect(runReq.type).toBe('RUN_CODE');
    expect(testReq.type).toBe('RUN_TESTS');

    const readyResp: WorkerResponse = { type: 'READY', version: '3.14.2' };
    const successResp: WorkerResponse = {
      type: 'RUN_SUCCESS',
      payload: { output: '1\n', executionTimeMs: 15 },
    };
    const testResp: WorkerResponse = {
      type: 'TEST_RESULTS',
      payload: {
        passed: true,
        output: 'ok',
        taskId: 't1',
        tests: [{ name: 'test1', passed: true }],
        executionTimeMs: 25,
      },
    };
    const errResp: WorkerResponse = {
      type: 'ERROR',
      payload: { message: 'SyntaxError', isTimeout: false },
    };

    expect(readyResp.type).toBe('READY');
    expect(successResp.type).toBe('RUN_SUCCESS');
    expect(testResp.type).toBe('TEST_RESULTS');
    expect(errResp.type).toBe('ERROR');
  });

  it('интерфейс StudentProgressState корректно инициализируется без опциональных any полей', () => {
    const progress: StudentProgressState = {
      currentScore: 0,
      currentStepId: 'step-1',
      completedTasks: {},
      userSavedCode: {},
      isExamUnlocked: false,
      isExamCompleted: false,
      lastUpdatedIso: new Date().toISOString(),
    };

    expect(progress.currentScore).toBe(0);
    expect(typeof progress.lastUpdatedIso).toBe('string');
  });
});
