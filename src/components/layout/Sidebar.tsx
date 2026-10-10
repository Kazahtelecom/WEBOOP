import React from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { demoCourse } from '../../data/demoCourse';
import { BookOpen, Code2, CheckCircle2, Lock, ChevronDown } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const setActiveStepId = useCourseStore((state) => state.setActiveStepId);
  const completedTasks = useCourseStore((state) => state.completedTasks);

  const demoWeek = demoCourse.weeks[0];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-slate-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Содержание курса
        </h2>
      </div>

      <div className="flex-1 py-2 space-y-4 px-2">
        {/* Активный демо-модуль */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5 text-xs font-medium text-slate-300">
            <span className="truncate font-semibold text-indigo-400">Демо-модуль</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-0.5 pl-1">
            {/* Лекция */}
            <button
              onClick={() => setActiveStepId(demoWeek.lecture.id)}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-md text-xs transition text-left ${
                currentStepId === demoWeek.lecture.id
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate flex-1">{demoWeek.lecture.title}</span>
            </button>

            {/* Задача практики */}
            {demoWeek.practiceTasks.map((task) => {
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
                  <span className="truncate flex-1">{task.title}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      +{task.scorePoints}б
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Будущие недели курса (Locked/Скоро) */}
        <div className="space-y-1 opacity-60">
          <div className="px-2 py-1 text-xs font-medium text-slate-500">Предстоящие недели</div>

          <div className="space-y-1 pl-1">
            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="truncate">Неделя 1: Классы и инкапсуляция</span>
            </div>

            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="truncate">Неделя 2: Наследование и композиция</span>
            </div>

            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="truncate">Неделя 3: Полиморфизм и протоколы</span>
            </div>

            <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-slate-500 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              <span className="truncate">Экзамен: Практический багфикс-квест (25б)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Все вычисления в браузере (Local-first)
      </div>
    </aside>
  );
};
