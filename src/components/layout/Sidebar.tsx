import React, { useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { weboopCourse } from '../../data/courseData';
import { demoCourse } from '../../data/demoCourse';
import { BookOpen, Code2, CheckCircle2, Lock, ChevronDown, ChevronRight, Terminal } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const setActiveStepId = useCourseStore((state) => state.setActiveStepId);
  const completedTasks = useCourseStore((state) => state.completedTasks);

  const [isWeek1Expanded, setIsWeek1Expanded] = useState(true);
  const [isDemoExpanded, setIsDemoExpanded] = useState(false);

  const week1 = weboopCourse.weeks[0];
  const demoWeek = demoCourse.weeks[0];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/70 flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-slate-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Содержание курса
        </h2>
      </div>

      <div className="flex-1 py-2 space-y-3 px-2">
        {/* Неделя 1: Активный учебный модуль */}
        <div className="space-y-1">
          <button
            onClick={() => setIsWeek1Expanded(!isWeek1Expanded)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-900 rounded transition"
          >
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-semibold text-indigo-400">Неделя 1</span>
              <span className="text-[10px] text-slate-400 truncate">({week1.topic})</span>
            </div>
            {isWeek1Expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
          </button>

          {isWeek1Expanded && (
            <div className="space-y-0.5 pl-1">
              {/* Лекция Недели 1 */}
              <button
                onClick={() => setActiveStepId(week1.lecture.id)}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition text-left ${
                  currentStepId === week1.lecture.id
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate flex-1">Теория: Инкапсуляция</span>
              </button>

              {/* Практические задания Недели 1 */}
              {week1.practiceTasks.map((task) => {
                const isCompleted = Boolean(completedTasks[task.id]);
                const isActive = currentStepId === task.id;

                return (
                  <button
                    key={task.id}
                    onClick={() => setActiveStepId(task.id)}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition text-left ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                    <span className="truncate flex-1">Практика: TransitCard</span>
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

              {/* Домашнее задание Недели 1 */}
              {week1.homeworkTask && (
                <button
                  onClick={() => setActiveStepId(week1.homeworkTask.id)}
                  className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition text-left ${
                    currentStepId === week1.homeworkTask.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  <span className="truncate flex-1">ДЗ: Passenger</span>
                  {completedTasks[week1.homeworkTask.id] ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                      +{week1.homeworkTask.scorePoints}б
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Предстоящие модули курса (Locked) */}
        <div className="space-y-1 pt-1 border-t border-slate-900">
          <div className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider text-[10px]">
            Предстоящие недели
          </div>

          <div className="space-y-1 pl-1">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <div className="flex items-center space-x-2 truncate">
                <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate">Неделя 2: Композиция</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">25б</span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <div className="flex items-center space-x-2 truncate">
                <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate">Неделя 3: Полиморфизм</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">25б</span>
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <div className="flex items-center space-x-2 truncate">
                <Lock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <span className="truncate">Экзамен: Багфикс-квест</span>
              </div>
              <span className="text-[10px] text-amber-500/70 font-mono">25б</span>
            </div>
          </div>
        </div>

        {/* Песочница / Демо-модуль */}
        <div className="space-y-1 pt-2 border-t border-slate-900">
          <button
            onClick={() => setIsDemoExpanded(!isDemoExpanded)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-400 transition"
          >
            <div className="flex items-center space-x-1.5">
              <Terminal className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Песочница / Демо</span>
            </div>
            {isDemoExpanded ? (
              <ChevronDown className="w-3 h-3 text-slate-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-500" />
            )}
          </button>

          {isDemoExpanded && (
            <div className="space-y-0.5 pl-1">
              <button
                onClick={() => setActiveStepId(demoWeek.lecture.id)}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs transition text-left ${
                  currentStepId === demoWeek.lecture.id
                    ? 'bg-slate-800 text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <BookOpen className="w-3 h-3 text-slate-500" />
                <span className="truncate">Демо: О платформе</span>
              </button>

              <button
                onClick={() => setActiveStepId(demoWeek.practiceTasks[0].id)}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs transition text-left ${
                  currentStepId === demoWeek.practiceTasks[0].id
                    ? 'bg-slate-800 text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <Code2 className="w-3 h-3 text-slate-500" />
                <span className="truncate">Демо: Класс Counter</span>
              </button>
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
