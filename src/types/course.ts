/**
 * Канонические интерфейсы доменной модели WEBOOP LMS
 * Источник истины: docs/domain/model.md
 */

export interface InteractiveCheck {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  contentMarkdown: string;
  quickChecks: InteractiveCheck[];
}

export interface CodeTask {
  id: string;
  title: string;
  descriptionMarkdown: string;
  starterCode: string;
  testCode: string;
  scorePoints: number;
  hints?: string[];
}

export interface WeekModule {
  weekNumber: 1 | 2 | 3;
  topic: string;
  description: string;
  maxScore: number;
  lecture: Lesson;
  practiceTasks: CodeTask[];
  homeworkTask: CodeTask;
}

export interface ExamModule {
  id: 'final-exam';
  title: string;
  descriptionMarkdown: string;
  buggyCode: string;
  testCode: string;
  examScore: 25;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  weeks: WeekModule[];
  finalExam?: ExamModule;
  totalMaxScore: number;
}

export interface StudentProgressState {
  currentScore: number;
  currentStepId: string;
  completedTasks: Record<string, boolean>;
  userSavedCode: Record<string, string>;
  isExamUnlocked: boolean;
  isExamCompleted: boolean;
  lastUpdatedIso: string;
}
