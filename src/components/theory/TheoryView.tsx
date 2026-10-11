import React, { useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { getCourseItemById } from '../../data/courseData';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, Lightbulb, ChevronRight, Award } from 'lucide-react';
import type { Lesson, CodeTask } from '../../types/course';

export const TheoryView: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const completedTasks = useCourseStore((state) => state.completedTasks);

  // Состояние ответов на тесты самоконтроля { [qcId]: selectedIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showHints, setShowHints] = useState(false);

  // Поиск активного элемента в курсе
  const item = getCourseItemById(currentStepId);
  let activeLesson: Lesson | null = null;
  let activeTask: CodeTask | null = null;

  if (item?.type === 'lesson') {
    activeLesson = item.lesson;
  } else if (item?.type === 'task') {
    activeTask = item.task;
  }

  const handleSelectOption = (qcId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qcId]: optionIndex,
    }));
  };

  const isCompleted = activeTask ? Boolean(completedTasks[activeTask.id]) : false;

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-900 text-slate-200">
      {/* Режим отображения лекции */}
      {activeLesson && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Лекция • {activeLesson.durationMinutes} мин</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100">{activeLesson.title}</h1>

          {/* Содержимое лекции */}
          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-slate-300 leading-relaxed whitespace-pre-line">
            {activeLesson.contentMarkdown}
          </div>

          {/* Блок самопроверки (Quick Checks) */}
          {activeLesson.quickChecks && activeLesson.quickChecks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
              <div className="flex items-center space-x-2 text-amber-400 text-sm font-semibold">
                <HelpCircle className="w-4 h-4" />
                <span>Вопросы для самоконтроля ({activeLesson.quickChecks.length})</span>
              </div>

              {activeLesson.quickChecks.map((qc, qIndex) => {
                const userChoice = selectedAnswers[qc.id];
                const hasAnswered = userChoice !== undefined;

                return (
                  <div
                    key={qc.id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-start space-x-2 text-xs font-medium text-slate-400">
                      <span className="font-mono text-indigo-400">Вопрос {qIndex + 1}:</span>
                      <span className="text-slate-200 text-sm font-medium">{qc.question}</span>
                    </div>

                    <div className="space-y-2">
                      {qc.options.map((option, idx) => {
                        let btnStyle =
                          'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300';
                        if (hasAnswered) {
                          if (idx === qc.correctOptionIndex) {
                            btnStyle =
                              'border-emerald-600/60 bg-emerald-950/40 text-emerald-300 font-medium';
                          } else if (idx === userChoice) {
                            btnStyle = 'border-red-600/60 bg-red-950/40 text-red-300';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(qc.id, idx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {hasAnswered && idx === qc.correctOptionIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2 flex-shrink-0" />
                            )}
                            {hasAnswered && idx === userChoice && idx !== qc.correctOptionIndex && (
                              <XCircle className="w-4 h-4 text-red-400 ml-2 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        <span className="font-semibold text-indigo-400">Пояснение: </span>
                        {qc.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Режим отображения задачи */}
      {activeTask && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Интерактивное задание
                </span>
                {isCompleted && (
                  <span className="flex items-center space-x-1 text-[11px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Выполнено</span>
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-100 mt-1">{activeTask.title}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Награда:</span>
              <div className="text-lg font-bold text-amber-400 font-mono flex items-center justify-end space-x-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span>+{activeTask.scorePoints}б</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            {/* Описание задачи */}
            <div className="prose prose-invert prose-sm max-w-none space-y-3 whitespace-pre-line text-slate-300">
              {activeTask.descriptionMarkdown}
            </div>

            {/* Подсказки */}
            {activeTask.hints && activeTask.hints.length > 0 && (
              <div className="mt-6 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Подсказки ({activeTask.hints.length})</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      showHints ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showHints && (
                  <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-900/60">
                    {activeTask.hints.map((hint, idx) => (
                      <div key={idx} className="text-xs text-slate-400 flex items-start space-x-2">
                        <span className="text-amber-400 font-mono">{idx + 1}.</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Если шаг не найден */}
      {!activeLesson && !activeTask && (
        <div className="text-center py-12 text-slate-500">
          <p>Выберите учебный материал или задание в меню слева.</p>
        </div>
      )}
    </div>
  );
};
