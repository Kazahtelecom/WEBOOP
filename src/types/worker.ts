/**
 * Строго типизированный протокол взаимодействия UI и Web Worker
 * Источник истины: docs/architecture/execution-flow.md и TS AC-2
 */

export interface TestResultItem {
  name: string;
  passed: boolean;
  message?: string;
}

// Запросы из главного потока (UI) к Worker
export type WorkerRequest =
  | { type: 'INIT' }
  | { type: 'RUN_CODE'; payload: { code: string } }
  | { type: 'RUN_TESTS'; payload: { code: string; testCode: string; taskId: string } };

// Ответы из Worker в главный поток (UI)
export type WorkerResponse =
  | { type: 'READY'; version: string }
  | { type: 'RUN_SUCCESS'; payload: { output: string; executionTimeMs: number } }
  | {
      type: 'TEST_RESULTS';
      payload: {
        passed: boolean;
        output: string;
        taskId: string;
        tests: TestResultItem[];
        executionTimeMs: number;
        error?: string;
      };
    }
  | { type: 'ERROR'; payload: { message: string; isTimeout?: boolean } };

export type WorkerMessage = WorkerRequest | WorkerResponse;
