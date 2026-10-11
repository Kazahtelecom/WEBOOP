import React, { useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { weboopCourse } from '../../data/courseData';
import { BookOpen, Code2, CheckCircle2, Lock, ChevronDown, ChevronRight, Award } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const setActiveStepId = useCourseStore((state) => state.setActiveStepId);
  const completedTasks = useCourseStore((state) => state.completedTasks);
  const isExamUnlocked = useCourseStore((state) => state.isExamUnlocked);
  const isExamCompleted = useCourseStore((state) => state.isExamCompleted);

  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
  });

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekNumber]: !prev[weekNumber],
    }));
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/70 flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-slate-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Содержание курса
        </h2>
      </div>

      <div className="flex-1 py-2 space-y-2 px-2">
        {/* Динамический рендеринг всех недель курса */}
        {weboopCourse.weeks.map((week) => {
          const isExpanded = Boolean(expandedWeeks[week.weekNumber]);
          const isCurrentWeekActive =
            currentStepId === week.lecture.id ||
            week.practiceTasks.some((t) => t.id === currentStepId) ||
            week.homeworkTask?.id === currentStepId;

          return (
            <div key={week.weekNumber} className="space-y-1">
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded transition ${
                  isCurrentWeekActive
                    ? 'text-indigo-300 bg-slate-900/60'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="font-semibold text-indigo-400">Неделя {week.weekNumber}</span>
                  <span className="text-[10px] text-slate-400 truncate">({week.topic})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-0.5 pl-1.5">
                  {/* Лекция недели */}
                  <button
                    onClick={() => setActiveStepId(week.lecture.id)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition text-left ${
                      currentStepId === week.lecture.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate flex-1">{week.lecture.title}</span>
                  </button>

                  {/* Практические задания недели */}
                  {week.practiceTasks.map((task) => {
                    const isCompleted = Boolean(completedTasks[task.id]);
                    const isActive = currentStepId === task.id;

                    return (
                      <button
                        key={task.id}
                        onClick={() => setActiveStepId(task.id)}
                        className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition text-left ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                        <span className="truncate flex-1">{task.title}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                            +{task.scorePoints}б
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Домашнее задание недели */}
                  {week.homeworkTask && (
                    <button
                      onClick={() => setActiveStepId(week.homeworkTask.id)}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs transition text-left ${
                        currentStepId === week.homeworkTask.id
                          ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span className="truncate flex-1">{week.homeworkTask.title}</span>
                      {completedTasks[week.homeworkTask.id] ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                          +{week.homeworkTask.scorePoints}б
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Секция Финального Экзамена (динамическая разблокировка при 75+ баллов) */}
        <div className="pt-2 border-t border-slate-900">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Итоговый контроль
          </div>

          {isExamUnlocked ? (
            <button
              onClick={() => setActiveStepId('final-exam')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition border text-left ${
                currentStepId === 'final-exam'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-semibold'
                  : 'bg-amber-950/20 border-amber-800/40 text-amber-300 hover:bg-amber-900/30'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="truncate">Финальный экзамен (Квест)</span>
              </div>
              {isExamCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  +25б
                </span>
              )}
            </button>
          ) : (
            <div
              title="Для допуска к экзамену необходимо набрать минимум 75 баллов за Недели 1–3"
              className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-500 bg-slate-900/30 border border-slate-900 cursor-not-allowed select-none"
            >
              <div className="flex items-center space-x-2 truncate">
                <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate">Экзамен: Багфикс-квест</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">Требуется 75б</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Курс Avtobys • Local-first
      </div>
    </aside>
  );
};
