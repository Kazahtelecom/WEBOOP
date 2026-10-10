import type { Course, CodeTask, Lesson } from '../types/course';

export const demoLesson: Lesson = {
  id: 'demo-intro',
  title: 'Введение в среду разработки WEBOOP',
  durationMinutes: 10,
  contentMarkdown: `# Добро пожаловать в WEBOOP LMS!

Это интерактивная система обучения объектно-ориентированному программированию на Python.

### Особенности среды:
- **Автономность:** Весь код выполняется прямо в вашем браузере с помощью WebAssembly (Pyodide).
- **Мгновенный отклик:** Никаких очередей к удаленным серверам.
- **Безопасность:** Защитный таймер автоматически прервет выполнение при случайном бесконечном цикле.
- **Сохранность:** Ваш набранный код автоматически сохраняется при каждом изменении.

Выберите задачу в меню слева, чтобы перейти к практическому упражнению.`,
  quickChecks: [
    {
      id: 'qc-1',
      question: 'Где выполняется Python-код в WEBOOP LMS?',
      options: [
        'На удаленном сервере в облаке',
        'В локальном браузере с помощью WebAssembly (Pyodide Web Worker)',
        'В установленном на компьютере интерпретаторе Python',
        'В расширении Visual Studio Code',
      ],
      correctOptionIndex: 1,
      explanation:
        'Система построена по принципу Local-first и запускает CPython внутри браузерного Web Worker.',
    },
  ],
};

export const demoTask: CodeTask = {
  id: 'demo-task-1',
  title: 'Демо-задача: Класс Counter (Счетчик)',
  descriptionMarkdown: `## Практическое задание: Класс Counter

Создайте класс \`Counter\`, моделирующий простой целочисленный счетчик.

### Требования к классу:
1. Конструктор \`__init__(self)\`: инициализирует внутреннее значение счетчика нулем (\`0\`).
2. Метод \`inc(self)\`: увеличивает значение счетчика на \`1\`.
3. Метод \`get_value(self)\`: возвращает текущее значение счетчика.

### Пример использования:
\`\`\`python
c = Counter()
print(c.get_value()) # 0
c.inc()
c.inc()
print(c.get_value()) # 2
\`\`\`
`,
  starterCode: `class Counter:
    def __init__(self):
        # Инициализируйте начальное значение счетчика
        pass

    def inc(self):
        # Увеличьте значение счетчика на 1
        pass

    def get_value(self):
        # Верните текущее значение счетчика
        pass
`,
  testCode: `
# Проверочные тесты
c1 = Counter()
assert hasattr(c1, 'get_value'), "Класс Counter должен иметь метод get_value()"
assert hasattr(c1, 'inc'), "Класс Counter должен иметь метод inc()"
assert c1.get_value() == 0, f"Начальное значение должно быть 0, получено {c1.get_value()}"

c1.inc()
assert c1.get_value() == 1, f"После одного inc() значение должно быть 1, получено {c1.get_value()}"

c1.inc()
c1.inc()
assert c1.get_value() == 3, f"После трех inc() значение должно быть 3, получено {c1.get_value()}"

c2 = Counter()
assert c2.get_value() == 0, "Новый экземпляр Counter должен начинаться с 0 (независимость объектов)"

print("[OK] Test 1: Инициализация счетчика со значением 0")
print("[OK] Test 2: Инкремент счетчика (inc)")
print("[OK] Test 3: Независимость экземпляров класса")
print("[OK] Все тесты пройдены! (+10 баллов)")
`,
  scorePoints: 10,
  hints: [
    'В методе __init__(self) создайте атрибут self.value = 0',
    'В методе inc(self) выполните self.value += 1',
    'В методе get_value(self) верните self.value',
  ],
};

export const demoCourse: Course = {
  id: 'course-oop-demo',
  title: 'Объектно-ориентированное программирование на Python',
  description:
    'Интерактивный мини-курс для второкурсников: основы ООП, классы, инкапсуляция, наследование и полиморфизм.',
  totalMaxScore: 100,
  weeks: [
    {
      weekNumber: 1,
      topic: 'Демо-модуль платформы (Тестирование рантайма)',
      description: 'Знакомство со средой разработки и проверка работоспособности Python в Web Worker',
      maxScore: 10,
      lecture: demoLesson,
      practiceTasks: [demoTask],
      homeworkTask: demoTask,
    },
  ],
};
