import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StudentProgressState } from '../types/course';

export interface CourseStoreState extends StudentProgressState {
  setActiveStepId: (stepId: string) => void;
  setUserCode: (taskId: string, code: string) => void;
  completeTask: (taskId: string, points: number) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (jsonString: string) => boolean;
}

const memoryStorage: Record<string, string> = {};
const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return memoryStorage[name] ?? null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
    } else {
      memoryStorage[name] = value;
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
    } else {
      delete memoryStorage[name];
    }
  },
};

const DEFAULT_INITIAL_STATE: StudentProgressState = {
  currentScore: 0,
  currentStepId: 'week-1-lecture',
  completedTasks: {},
  userSavedCode: {},
  isExamUnlocked: false,
  isExamCompleted: false,
  lastUpdatedIso: new Date().toISOString(),
};

export const useCourseStore = create<CourseStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_INITIAL_STATE,

      setActiveStepId: (stepId: string) => {
        set({
          currentStepId: stepId,
          lastUpdatedIso: new Date().toISOString(),
        });
      },

      setUserCode: (taskId: string, code: string) => {
        set((state) => ({
          userSavedCode: {
            ...state.userSavedCode,
            [taskId]: code,
          },
          lastUpdatedIso: new Date().toISOString(),
        }));
      },

      completeTask: (taskId: string, points: number) => {
        set((state) => {
          if (state.completedTasks[taskId]) {
            return state; // Баллы за повторное решение не начисляются повторно
          }
          const nextCompletedTasks = {
            ...state.completedTasks,
            [taskId]: true,
          };
          const nextScore = Math.min(100, state.currentScore + points);
          const isExamUnlocked = nextScore >= 75;
          const isExamCompleted = taskId === 'final-exam' ? true : state.isExamCompleted;

          return {
            completedTasks: nextCompletedTasks,
            currentScore: nextScore,
            isExamUnlocked,
            isExamCompleted,
            lastUpdatedIso: new Date().toISOString(),
          };
        });
      },

      resetProgress: () => {
        set({
          ...DEFAULT_INITIAL_STATE,
          lastUpdatedIso: new Date().toISOString(),
        });
      },

      exportProgress: () => {
        const state = get();
        const exportData: StudentProgressState = {
          currentScore: state.currentScore,
          currentStepId: state.currentStepId,
          completedTasks: state.completedTasks,
          userSavedCode: state.userSavedCode,
          isExamUnlocked: state.isExamUnlocked,
          isExamCompleted: state.isExamCompleted,
          lastUpdatedIso: state.lastUpdatedIso,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importProgress: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString) as Partial<StudentProgressState>;
          if (
            typeof parsed.currentScore !== 'number' ||
            typeof parsed.currentStepId !== 'string' ||
            typeof parsed.completedTasks !== 'object' ||
            typeof parsed.userSavedCode !== 'object'
          ) {
            return false;
          }

          set({
            currentScore: parsed.currentScore,
            currentStepId: parsed.currentStepId,
            completedTasks: parsed.completedTasks || {},
            userSavedCode: parsed.userSavedCode || {},
            isExamUnlocked: Boolean(parsed.isExamUnlocked),
            isExamCompleted: Boolean(parsed.isExamCompleted),
            lastUpdatedIso: parsed.lastUpdatedIso || new Date().toISOString(),
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'weboop_student_progress',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
