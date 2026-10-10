import React, { useState } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import { demoLesson, demoTask } from '../../data/demoCourse';
import { BookOpen, HelpCircle, CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';

export const TheoryView: React.FC = () => {
  const currentStepId = useCourseStore((state) => state.currentStepId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const isLesson = currentStepId === demoLesson.id;
  const isTask = currentStepId === demoTask.id;

  const handleSelectOption = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-900 text-slate-200">
      {isLesson && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Лекция • {demoLesson.durationMinutes} мин</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100">{demoLesson.title}</h1>

          <div className="prose prose-invert prose-sm max-w-none space-y-4 text-slate-300 leading-relaxed">
            <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-indigo-200 text-sm">
              <p className="font-semibold mb-1">Добро пожаловать в WEBOOP LMS!</p>
              <p>Интерактивная образовательная система по ООП на Python для второкурсников.</p>
            </div>

            <h3 className="text-lg font-semibold text-slate-100 mt-6">Особенности среды:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>
                <strong className="text-slate-100">Local-first автономность:</strong> Весь код
                компилируется и исполняется прямо в браузере с помощью WebAssembly (Pyodide).
              </li>
              <li>
                <strong className="text-slate-100">Мгновенный отклик:</strong> Нет сетевых задержек
                и очередей к удаленным серверам.
              </li>
              <li>
                <strong className="text-slate-100">Изоляция рантайма:</strong> Python выполняется в
                фоновом Web Worker.
              </li>
              <li>
                <strong className="text-slate-100">Безопасность UI:</strong> 5-секундный таймер
                автоматически прерывает бесконечные циклы.
              </li>
              <li>
                <strong className="text-slate-100">Сохранность данных:</strong> Набранный код
                мгновенно сохраняется в браузере.
              </li>
            </ul>
          </div>

          {/* Интерактивная самопроверка */}
          {demoLesson.quickChecks.map((qc) => (
            <div
              key={qc.id}
              className="mt-8 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4"
            >
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-medium">
                <HelpCircle className="w-4 h-4" />
                <span>Проверь себя (Самоконтроль)</span>
              </div>
              <p className="font-medium text-slate-100 text-sm">{qc.question}</p>

              <div className="space-y-2">
                {qc.options.map((option, idx) => {
                  let btnStyle = 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-300';
                  if (selectedOption !== null) {
                    if (idx === qc.correctOptionIndex) {
                      btnStyle = 'border-emerald-600/60 bg-emerald-950/40 text-emerald-300 font-medium';
                    } else if (idx === selectedOption) {
                      btnStyle = 'border-red-600/60 bg-red-950/40 text-red-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {selectedOption !== null && idx === qc.correctOptionIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2 flex-shrink-0" />
                      )}
                      {selectedOption === idx && idx !== qc.correctOptionIndex && (
                        <XCircle className="w-4 h-4 text-red-400 ml-2 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-indigo-400">Пояснение: </span>
                  {qc.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isTask && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Практическое задание
              </span>
              <h1 className="text-xl font-bold text-slate-100 mt-1">{demoTask.title}</h1>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Награда:</span>
              <div className="text-lg font-bold text-amber-400 font-mono">
                +{demoTask.scorePoints} баллов
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <h3 className="text-base font-semibold text-slate-100">Условие задачи</h3>
            <p>
              Создайте класс <code className="text-indigo-300 bg-slate-800 px-1.5 py-0.5 rounded">Counter</code>,
              моделирующий работу целочисленного счетчика.
            </p>

            <h4 className="font-semibold text-slate-200 mt-4">Требования к методам:</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <code className="text-indigo-400 font-semibold font-mono text-xs">__init__(self)</code>
                <p className="text-xs text-slate-400 mt-1">
                  Конструктор класса. Инициализирует внутреннее состояние счетчика значением 0.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <code className="text-indigo-400 font-semibold font-mono text-xs">inc(self)</code>
                <p className="text-xs text-slate-400 mt-1">
                  Метод инкремента. Увеличивает текущее значение счетчика на единицу (1).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <code className="text-indigo-400 font-semibold font-mono text-xs">get_value(self)</code>
                <p className="text-xs text-slate-400 mt-1">
                  Метод чтения. Возвращает текущее целое число (значение счетчика).
                </p>
              </div>
            </div>

            {/* Подсказки */}
            {demoTask.hints && demoTask.hints.length > 0 && (
              <div className="mt-6 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-between p-3 text-xs font-medium text-slate-300 hover:bg-slate-900 transition"
                >
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Подсказки ({demoTask.hints.length})</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      showHints ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {showHints && (
                  <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-900/60">
                    {demoTask.hints.map((hint, idx) => (
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
    </div>
  );
};
