import type { Course, CodeTask, Lesson } from '../types/course';
import { week1Lecture, week1PracticeTask, week1HomeworkTask } from './week1';
import { week2Lecture, week2PracticeTask, week2HomeworkTask } from './week2';
import { week3Lecture, week3PracticeTask, week3HomeworkTask } from './week3';
import { finalExam } from './exam';

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
        'Моделирование автобусов, маршрутов, транспортных карт и разовых билетов Avtobys: сокрытие состояния, защита инвариантов вместимости, вычисления в Decimal и валидация поездок.',
      maxScore: 25,
      lecture: week1Lecture,
      practiceTasks: [week1PracticeTask],
      homeworkTask: week1HomeworkTask,
    },
    {
      weekNumber: 2,
      topic: 'Наследование и композиция («Composition over Inheritance»)',
      description:
        'Контекст расчета тарифов: преодоление комбинаторного взрыва подклассов через композицию независимых политик скидок, зон и часов пик.',
      maxScore: 25,
      lecture: week2Lecture,
      practiceTasks: [week2PracticeTask],
      homeworkTask: week2HomeworkTask,
    },
    {
      weekNumber: 3,
      topic: 'Полиморфизм, абстракции и протоколы',
      description:
        'Валидаторы в автобусах и обработка платежей: Duck Typing, протоколы typing.Protocol и полиморфная диспетчеризация без каскадов if/elif.',
      maxScore: 25,
      lecture: week3Lecture,
      practiceTasks: [week3PracticeTask],
      homeworkTask: week3HomeworkTask,
    },
  ],
  finalExam,
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

  if (weboopCourse.finalExam && weboopCourse.finalExam.id === stepId) {
    return {
      type: 'task',
      task: {
        id: weboopCourse.finalExam.id,
        title: weboopCourse.finalExam.title,
        descriptionMarkdown: weboopCourse.finalExam.descriptionMarkdown,
        starterCode: weboopCourse.finalExam.buggyCode,
        testCode: weboopCourse.finalExam.testCode,
        scorePoints: weboopCourse.finalExam.examScore,
        hints: [
          'Баг 1: Проверьте условие вместимости ДО увеличения _current_passengers.',
          'Баг 2: В калькуляторе тарифа примените self._discount_policy.apply(zoned).',
          'Баг 3: Удалите проверку isinstance(payment, CardPayment) и вызывайте process_payment полиморфно.',
        ],
      },
    };
  }

  return null;
}
