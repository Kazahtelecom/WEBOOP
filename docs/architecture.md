# Архитектура системы WEBOOP

Документ описывает общую архитектуру мини-LMS, модель данных, компоненты и поток данных (Data Flow).

---

## 1. Обзор архитектуры (C4 Component Diagram)

Система построена по клиентской архитектуре (Single Page Application / Local-first) с изоляцией сред выполнения:

```mermaid
flowchart TD
    subgraph Browser ["Браузер студента (Local-first)"]
        subgraph UI ["Слой представления (React + Tailwind)"]
            Sidebar["Навигация / Прогресс курса"]
            TheoryView["Просмотр теории (Markdown)"]
            CodeEditor["Редактор кода (CodeMirror)"]
            Terminal["Терминал вывода и результат тестов"]
            ScoreBadge["Счётчик баллов"]
        end

        subgraph Store ["Слой состояния (Zustand)"]
            CourseStore["Управление прогрессом, баллами и кодом"]
            LocalStorage[("Local Storage\n(Автосохранение)")]
        end

        subgraph WorkerLayer ["Изолированный Web Worker"]
            PyWorker["Pyodide Web Worker"]
            PyodideRuntime["CPython 3.14 (WASM)"]
            TestRunner["Скрипт запуска тестов (unittest/assert)"]
        end
    end

    UI -->|Чтение и экшены| CourseStore
    CourseStore <-->|Синхронизация| LocalStorage
    UI -->|Запуск кода / тестов| PyWorker
    PyWorker --> PyodideRuntime
    PyodideRuntime --> TestRunner
    PyWorker -->|Результат выполнения / ошибки| UI
```

---

## 2. Поток выполнения кода и тестов (Sequence Diagram)

Чтобы избежать зависания страницы при ошибках студента (например, бесконечный цикл `while True:`), Python-рантайм вынесен в отдельный поток `Web Worker`:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Студент
    participant Editor as CodeEditor (UI)
    participant WorkerBridge as Pyodide Worker Bridge
    participant Worker as Web Worker (Pyodide WASM)
    participant Output as Terminal / Test Results

    Student->>Editor: Нажимает "Проверить решение"
    Editor->>WorkerBridge: runTests(userCode, testCode)
    WorkerBridge->>Output: Показать статус "Выполняется..."
    
    alt Рантайм ещё не загружен
        WorkerBridge->>Worker: INIT_RUNTIME
        Worker-->>WorkerBridge: RUNTIME_READY
    end

    WorkerBridge->>Worker: POST_MESSAGE { type: 'EXECUTE', code, tests }
    
    critical Изоляция и таймаут
        Worker->>Worker: Выполнение кода студента + тестов
        Worker-->>WorkerBridge: { status: 'SUCCESS' | 'FAIL', stdout, results, passed }
    option Таймаут (превышено 5 сек)
        WorkerBridge->>Worker: terminate() (принудительный останов)
        WorkerBridge->>Output: Ошибка: Превышен лимит времени (Time Limit Exceeded)
    end

    WorkerBridge->>Output: Отображение результатов тестов и вывода stdout
    alt Все тесты пройдены
        WorkerBridge->>Student: Начисление баллов и разблокировка след. шага
    end
```

---

## 3. Модель данных (Data Model / UML Class Diagram)

Модель данных описывает структуру курса, состоящую из 3 недель, шагов и состояния студента:

```mermaid
classDiagram
    class Course {
        +string title
        +Week[] weeks
        +Exam finalExam
    }

    class Week {
        +number id (1..3)
        +string topic
        +Lesson lecture
        +Practice practice
        +Homework homework
        +number maxScore
    }

    class Step {
        <<interface>>
        +string id
        +string title
        +string theoryMarkdown
    }

    class CodeTask {
        +string id
        +string title
        +string descriptionMarkdown
        +string starterCode
        +string solutionCode
        +string testCode
        +number scoreWeight
    }

    class StudentProgress {
        +number totalScore
        +Map~string, boolean~ completedSteps
        +Map~string, string~ savedCode
        +boolean examPassed
    }

    Course "1" *-- "3" Week : состоит из
    Week *-- "1" CodeTask : практика
    Week *-- "1" CodeTask : ДЗ
    Course *-- "1" CodeTask : экзамен
    StudentProgress ..> Course : отслеживает прохождение
```

---

## 4. Структура проекта (Source Tree Proposal)

Для удобства ИИ-агентов структура исходников организована плоско и интуитивно:

```text
WEBOOP/
├── docs/                     # Архитектура, стек, диаграммы (для человека и ИИ)
│   ├── stack.md              # ADR: Выбор технологий
│   └── architecture.md       # C4, Sequence, Class диаграммы
├── src/
│   ├── assets/               # Статические ресурсы (иконки, схемы)
│   ├── components/           # UI компоненты (React)
│   │   ├── layout/           # Sidebar, SplitPane, Header
│   │   ├── editor/           # CodeEditor, Terminal, TestResults
│   │   └── theory/           # MarkdownViewer, Callout
│   ├── content/              # Контент курса (Недели 1-3)
│   │   ├── week-1/           # Инкапсуляция: теория, задачи, тесты
│   │   ├── week-2/           # Наследование и композиция
│   │   ├── week-3/           # Полиморфизм и абстракции
│   │   └── exam/             # Практический экзамен (дебаг кода)
│   ├── store/                # Zustand стор (прогресс, баллы)
│   ├── types/                # Строгие TypeScript интерфейсы
│   └── worker/               # Pyodide Web Worker и мост взаимодействия
│       ├── pyodide.worker.ts # Код воркера
│       └── bridge.ts         # TypeScript обёртка для postMessage с таймаутами
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
