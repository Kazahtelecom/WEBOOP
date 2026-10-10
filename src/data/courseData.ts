import type { Course, CodeTask, Lesson } from '../types/course';
import { week1Lecture, week1PracticeTask, week1HomeworkTask } from './week1';

export const weboopCourse: Course = {
  id: 'course-weboop-avtobys',
  title: 'Объектно-ориентированное программирование: Сквозной кейс Avtobys',
  description:
    '3-недельный практический курс по ООП на Python: от инкапсуляции и защиты инвариантов до гибкой композиции и полиморфизма.',
  totalMaxScore: 100,
  weeks: [
    {
      weekNumber: 1,
      topic: 'Классы, объекты и инкапсуляция',
      description:
        'Моделирование транспортной карты Avtobys и пассажира: сокрытие состояния, защита инвариантов, вычисления в Decimal и принцип «Tell, Don’t Ask».',
      maxScore: 25,
      lecture: week1Lecture,
      practiceTasks: [week1PracticeTask],
      homeworkTask: week1HomeworkTask,
    },
    {
      weekNumber: 2,
      topic: 'Наследование и композиция («Composition over Inheritance»)',
      description:
        'Контекст расчета тарифов: преодоление комбинаторного взрыва подклассов через композицию независимых политик скидок и зон.',
      maxScore: 25,
      lecture: {
        id: 'week-2-lecture',
        title: 'Лекция 2: Наследование vs Композиция',
        durationMinutes: 45,
        contentMarkdown: '# Неделя 2: Наследование и композиция\n\nМодуль откроется на следующей неделе.',
        quickChecks: [],
      },
      practiceTasks: [],
      homeworkTask: {
        id: 'week-2-hw-placeholder',
        title: 'Домашнее задание 2 (Скоро)',
        descriptionMarkdown: 'Задание станет доступно во 2-й неделе курса.',
        starterCode: '# Домашнее задание 2\n',
        testCode: '',
        scorePoints: 10,
      },
    },
    {
      weekNumber: 3,
      topic: 'Полиморфизм, абстракции и протоколы',
      description:
        'Валидаторы в автобусах и обработка платежей: Duck Typing, протоколы typing.Protocol и полиморфная диспетчеризация без каскадов if/elif.',
      maxScore: 25,
      lecture: {
        id: 'week-3-lecture',
        title: 'Лекция 3: Полиморфизм и протоколы',
        durationMinutes: 45,
        contentMarkdown: '# Неделя 3: Полиморфизм и протоколы\n\nМодуль откроется на 3-й неделе.',
        quickChecks: [],
      },
      practiceTasks: [],
      homeworkTask: {
        id: 'week-3-hw-placeholder',
        title: 'Домашнее задание 3 (Скоро)',
        descriptionMarkdown: 'Задание станет доступно в 3-й неделе курса.',
        starterCode: '# Домашнее задание 3\n',
        testCode: '',
        scorePoints: 10,
      },
    },
  ],
  finalExam: {
    id: 'final-exam',
    title: 'Финальный экзамен: Практический багфикс-квест (25 баллов)',
    descriptionMarkdown:
      'Поиск и исправление 3 скрытых логических ошибок в связной транспортной подсистеме Avtobys.',
    buggyCode: '# Код финального экзамена\n',
    testCode: '# Тесты экзамена\n',
    examScore: 25,
  },
};

/**
 * Вспомогательная функция для быстрого поиска шага (урока или задачи) по ID
 */
export function getCourseItemById(
  stepId: string
): { type: 'lesson'; lesson: Lesson } | { type: 'task'; task: CodeTask } | null {
  for (const week of weboopCourse.weeks) {
    if (week.lecture.id === stepId) {
      return { type: 'lesson', lesson: week.lecture };
    }
    for (const task of week.practiceTasks) {
      if (task.id === stepId) {
        return { type: 'task', task };
      }
    }
    if (week.homeworkTask.id === stepId) {
      return { type: 'task', task: week.homeworkTask };
    }
  }

  return null;
}
