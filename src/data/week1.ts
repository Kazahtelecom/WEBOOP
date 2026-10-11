import type { Lesson, CodeTask } from '../types/course';

export const week1Lecture: Lesson = {
  id: 'week-1-lecture',
  title: 'Лекция: Классы, объекты и инкапсуляция в Avtobys',
  durationMinutes: 45,
  contentMarkdown: `# Неделя 1: Классы, объекты и инкапсуляция в Avtobys

Добро пожаловать в первый учебный модуль курса по Объектно-Ориентированному Программированию (ООП)!
В течение курса мы проектируем ядро доменной модели городской транспортной системы **Avtobys** (Алматы-Транзит).

---

### 1. От процедурного подхода к объектам

В процедурном подходе данные и функции оторваны друг от друга. Данные хранятся в открытых структурах (словарях, кортежах), а функции оперируют ими извне:

\`\`\`python
# Процедурный антипаттерн
bus = {
    "plate_number": "123 AB 02",
    "capacity": 50,
    "current_passengers": 48
}

def board(bus_dict, count):
    bus_dict["current_passengers"] += count

# Опасность: любая функция может случайно нарушить физический инвариант:
board(bus, 10)  # В салоне 58 пассажиров при вместимости 50!
bus["current_passengers"] = -5  # Отрицательное число людей!
\`\`\`

**Проблемы процедурного подхода в сложных системах:**
1. **Отсутствие защиты целостности:** любой участок кода может перезаписать состояние напрямую.
2. **Дублирование валидации:** проверки \`0 <= current_passengers <= capacity\` приходится повторять в каждом месте посадки и высадки.
3. **Хрупкость контрактов:** изменение структуры словаря ломает десятки несвязанных функций.

---

### 2. Инвариант класса и принцип сокрытия данных

> **Инвариант класса (Class Invariant)** — непреложное условие истинности состояния объекта, которое выполняется после выхода из конструктора (\`__init__\`) и до/после вызова любого публичного метода.

Для сущности **Автобус (\`Bus\`)**:
- Вместимость (\`capacity\`) строго в пределах \`[10; 250]\`.
- Текущие пассажиры (\`current_passengers\`) строго в диапазоне \`[0; capacity]\`.
- Госномер (\`plate_number\`) — непустая валидная строка.

Для сущности **Маршрут (\`Route\`)**:
- Базовый тариф (\`base_fare\`) — строго положительное число.
- Список остановок (\`stops\`) содержит минимум 2 пункта (начальный и конечный), и соседние остановки не дублируются.

Для сущности **Транспортная карта (\`TransitCard\`)**:
- Баланс не может опускаться ниже \`Decimal("0.00")\`.
- Пополнение разрешено только суммами от \`Decimal("100.00")\`.
- С заблокированной карты запрещены любые списания и пополнения.

---

### 3. Инкапсуляция в Python: Соглашения и @property

В языке Python нет аппаратного ключевого слова \`private\`. Инкапсуляция держится на соглашениях:

1. **Защищенные атрибуты (\`self._attribute\`):**
   Соглашение PEP 8: «Это внутренняя деталь реализации. Не обращайся к ней и не меняй её напрямую из внешнего кода!».
2. **Приватные атрибуты с искажением имен (\`self.__attribute\`):**
   Механизм *Name Mangling* трансформирует имя в \`_ClassName__attribute\`, защищая от конфликтов имен при наследовании.
3. **Свойства (\`@property\`):**
   Позволяют предоставить контролируемый публичный доступ к данным на чтение (Read-Only) без возможности неконтролируемой перезаписи извне:

\`\`\`python
class Bus:
    def __init__(self, plate_number: str, capacity: int):
        self._plate_number = plate_number
        self._capacity = capacity
        self._current_passengers = 0

    @property
    def capacity(self) -> int:
        """Вместимость доступна только для чтения."""
        return self._capacity

    @property
    def current_passengers(self) -> int:
        return self._current_passengers
\`\`\`

---

### 4. Принцип «Tell, Don't Ask» (Приказывай, а не спрашивай)

Антипаттерн **Anemic Domain Model** (Анемичная модель) превращает классы в простые «структуры данных с геттерами», а логику выносит наружу:

\`\`\`python
# АНТИПАТТЕРН: Внешний код спрашивает и манипулирует сам:
if bus.capacity - bus.current_passengers >= new_people:
    bus.current_passengers += new_people
\`\`\`

**Правильный ООП-подход (Tell, Don't Ask):**
Прикажите объекту выполнить операцию. Сам объект проверит свои инварианты и изменит состояние:

\`\`\`python
# ПРАВИЛЬНО: Инкапсулированная Rich Domain Model:
bus.board_passengers(new_people)
\`\`\`
Если свободных мест недостаточно, метод выбрасывает доменное исключение \`CapacityExceededError\`, сохраняя предыдущее корректное состояние салона.

---

### 5. Точность финансовых расчетов: Decimal вместо float

Числа \`float\` используют двоичное представление IEEE 754:
\`\`\`python
>>> 0.1 + 0.2 == 0.3
False  # 0.30000000000000004
\`\`\`
В биллинге и тарифах общественного транспорта накапливающиеся погрешности \`float\` недопустимы. В реальных финтех-системах всегда применяется стандартный модуль \`decimal.Decimal\`:

\`\`\`python
from decimal import Decimal

base_fare = Decimal("100.00")
discount = Decimal("0.20")
effective_fare = base_fare * (Decimal("1.00") - discount)  # Ровно Decimal('80.00')
\`\`\`

---

### 6. Доменные исключения (Domain Exceptions)

Надежный код сигнализирует о нарушении инвариантов бизнес-логики через специализированные классы исключений, наследуемые от \`Exception\`:
\`\`\`python
class CapacityExceededError(Exception):
    """Превышена максимальная вместимость автобуса."""
    pass

class InsufficientFundsError(Exception):
    """Недостаточно средств на балансе карты."""
    pass

class TicketExpiredError(Exception):
    """Срок действия разового билета (60 минут) истек."""
    pass
\`\`\`
`,
  quickChecks: [
    {
      id: 'qc-1',
      question:
        'Какую роль в Python играет префикс с одним подчеркиванием перед именем атрибута (например, self._current_passengers)?',
      options: [
        'Интерпретатор Python блокирует любой доступ к этому полю на уровне языка',
        'Это соглашение разработчиков (PEP 8), сигнализирующее, что атрибут является внутренней деталью реализации и не должен изменяться напрямую',
        'Это специальный синтаксис для сохранения переменной в базу данных',
        'Это способ ускорить доступ к переменной в памяти CPython',
      ],
      correctOptionIndex: 1,
      explanation:
        'В Python нет аппаратного модификатора private. Префикс с одним подчеркиванием — общепринятый стандарт сообщества (PEP 8), обозначающий инкапсулированное защищенное состояние объекта.',
    },
    {
      id: 'qc-2',
      question:
        'Почему расчеты тарифов и баланса в транспортной системе должны выполняться в Decimal, а не во float?',
      options: [
        'Потому что float работает медленнее в циклах',
        'Потому что числа float подвержены ошибкам двоичного округления (например, 0.1 + 0.2 != 0.3), что приводит к финансовым искажениям',
        'Потому что модуль decimal является обязательным требованием компилятора WebAssembly',
        'Потому что тип float не поддерживает отрицательные числа',
      ],
      correctOptionIndex: 1,
      explanation:
        'Двоичный формат IEEE 754 не может точно выразить многие десятичные дроби. Для биллинга и платежей стандартом является класс decimal.Decimal с точной фиксированной арифметикой.',
    },
    {
      id: 'qc-3',
      question: 'В чем ключевая суть принципа «Tell, Don’t Ask» (Приказывай, а не спрашивай)?',
      options: [
        'Все методы объекта должны принимать только строковые команды',
        'Объект сам управляет своими данными и защищает инварианты в своих методах, вместо того чтобы внешний код извлекал данные и манипулировал ими',
        'В коде запрещено использовать оператор return',
        'Пользователь должен передавать аргументы только через системный терминал',
      ],
      correctOptionIndex: 1,
      explanation:
        'Принцип «Tell, Don’t Ask» предотвращает анемичность модели: вместо проверки условий снаружи (bus.current_passengers < bus.capacity) вы вызываете метод (bus.board_passengers(n)), а объект сам гарантирует свою целостность.',
    },
    {
      id: 'qc-4',
      question: 'Что такое инвариант класса?',
      options: [
        'Глобальная константа модуля',
        'Условие корректности состояния объекта, которое всегда выполняется после завершения конструктора и любого метода',
        'Метод, который никогда не возвращает значения',
        'Переменная, объявленная внутри блока try-except',
      ],
      correctOptionIndex: 1,
      explanation:
        'Инвариант гарантирует, что объект невозможно перевести в испорченное, недопустимое с точки зрения бизнес-логики состояние (например, отрицательное число пассажиров или отрицательный баланс карты).',
    },
  ],
};

export const week1PracticeTask: CodeTask = {
  id: 'week-1-practice-bus-route',
  title: 'Практика: Моделирование Bus и Route с защитой инвариантов',
  scorePoints: 15,
  descriptionMarkdown: `## Практическое задание: Классы Route и Bus (Лабораторная №1, Блок 1)

Вам предстоит спроектировать ядро транспортной модели **Avtobys**: маршрут следования (\`Route\`) и городской автобус (\`Bus\`).

### 1. Сущность \`Route\` (Маршрут):
- **Конструктор:** \`__init__(self, route_number: str, stops: list[str], base_fare: Decimal = Decimal("100.00"))\`
  - \`route_number\`: непустая строка. Если строка пустая или состоит из одних пробелов — выбросить \`ValueError\`.
  - \`base_fare\`: базовая стоимость проезда в тенге (\`Decimal\`). Должна быть строго больше нуля (\`base_fare > Decimal("0.00")\`), иначе выбросить \`ValueError\`.
  - \`stops\`: упорядоченный список названий остановок (\`list[str]\`).
    - Минимум 2 остановки (начальная и конечная). Если меньше 2 — выбросить \`ValueError\`.
    - Названия остановок не могут дублироваться подряд (например, \`["Абая", "Абая"]\` недопустимо) — выбросить \`ValueError\`.
- **Свойства (Read-Only):**
  - \`@property route_number -> str\`
  - \`@property base_fare -> Decimal\`
  - \`@property stops -> list[str]\` (возвращает копию списка остановок).

---

### 2. Исключение \`CapacityExceededError\`:
- Пользовательское исключение: \`class CapacityExceededError(Exception): pass\`.
- Выбрасывается при попытке посадки пассажиров сверх установленной вместимости.

---

### 3. Сущность \`Bus\` (Автобус):
- **Конструктор:** \`__init__(self, plate_number: str, capacity: int)\`
  - \`plate_number\`: государственный номер (например, \`"123 AB 02"\`). Непустая строка без лишних крайних пробелов (иначе \`ValueError\`).
  - \`capacity\`: максимальная вместимость (целое число от 10 до 250 человек включительно). Иначе выбросить \`ValueError\`.
  - Начальное количество пассажиров в салоне: \`_current_passengers = 0\`.
  - Начальный назначенный маршрут: \`_route = None\`.
- **Свойства (Read-Only):**
  - \`@property plate_number -> str\`
  - \`@property capacity -> int\`
  - \`@property current_passengers -> int\`
  - \`@property route -> Route | None\`
- **Методы:**
  - \`assign_route(self, route: Route) -> None\`: привязать маршрут к автобусу. Если передан не объект \`Route\` — выбросить \`TypeError\`.
  - \`board_passengers(self, count: int) -> None\`:
    - \`count\` должен быть строго положительным (\`count > 0\`), иначе \`ValueError\`.
    - Если \`self._current_passengers + count > self._capacity\` — выбросить \`CapacityExceededError\`.
    - **Важно:** при возникновении ошибки число пассажиров в салоне не должно измениться!
  - \`leave_passengers(self, count: int) -> None\`:
    - \`count\` должен быть строго положительным (\`count > 0\`), иначе \`ValueError\`.
    - Если \`count > self._current_passengers\` — выбросить \`ValueError\`.
    - Уменьшить \`_current_passengers\` на \`count\`.
`,
  starterCode: `from decimal import Decimal


class CapacityExceededError(Exception):
    """Выбрасывается при превышении максимальной вместимости автобуса."""
    pass


class Route:
    """
    Маршрут городского транспорта Avtobys.
    Гарантирует валидность номера маршрута, базового тарифа и списка остановок.
    """

    def __init__(
        self,
        route_number: str,
        stops: list[str],
        base_fare: Decimal = Decimal("100.00")
    ):
        # TODO: Проверьте инварианты route_number, base_fare и stops
        # и сохраните защищенные атрибуты _route_number, _base_fare, _stops
        pass

    @property
    def route_number(self) -> str:
        # TODO: Верните номер маршрута
        pass

    @property
    def base_fare(self) -> Decimal:
        # TODO: Верните базовый тариф (Decimal)
        pass

    @property
    def stops(self) -> list[str]:
        # TODO: Верните список остановок
        pass


class Bus:
    """
    Городской автобус Avtobys с контролем вместимости и привязкой к маршруту.
    """

    MIN_CAPACITY = 10
    MAX_CAPACITY = 250

    def __init__(self, plate_number: str, capacity: int):
        # TODO: Проверьте plate_number и capacity в диапазоне [10; 250]
        # Сохраните _plate_number, _capacity, _current_passengers = 0, _route = None
        pass

    @property
    def plate_number(self) -> str:
        pass

    @property
    def capacity(self) -> int:
        pass

    @property
    def current_passengers(self) -> int:
        pass

    @property
    def route(self) -> Route | None:
        pass

    def assign_route(self, route: Route) -> None:
        # TODO: Проверьте тип route и сохраните в _route
        pass

    def board_passengers(self, count: int) -> None:
        # TODO: Проверьте count > 0, защитите вместимость от переполнения (CapacityExceededError)
        pass

    def leave_passengers(self, count: int) -> None:
        # TODO: Проверьте count > 0 и count <= current_passengers
        pass
`,
  testCode: `from decimal import Decimal

# --- 1. Тестирование сущности Route ---
stops = ["Вокзал 1", "ЦУМ", "Парк Горького", "Медео"]
route = Route("32", stops, Decimal("120.00"))

assert route.route_number == "32", "Номер маршрута должен быть '32'"
assert route.base_fare == Decimal("120.00"), "Базовый тариф должен быть 120.00"
assert route.stops == stops, "Список остановок должен совпадать"
print("[OK] Test 1: Инициализация Route и геттеры свойств")

# Валидация Route
try:
    Route("", ["A", "B"])
    assert False, "Пустой route_number должен вызывать ValueError"
except ValueError:
    pass

try:
    Route("12", ["A", "B"], Decimal("0.00"))
    assert False, "Тариф <= 0 должен вызывать ValueError"
except ValueError:
    pass

try:
    Route("12", ["Только одна"])
    assert False, "Менее 2 остановок должно вызывать ValueError"
except ValueError:
    pass

try:
    Route("12", ["Абая", "Абая", "Саина"])
    assert False, "Подряд дублирующиеся остановки должны вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 2: Защита инвариантов Route (номер, тариф, остановки)")

# --- 2. Тестирование сущности Bus ---
bus = Bus("123 AB 02", 50)
assert bus.plate_number == "123 AB 02"
assert bus.capacity == 50
assert bus.current_passengers == 0
assert bus.route is None
print("[OK] Test 3: Инициализация Bus и начальное состояние")

# Валидация Bus
try:
    Bus("", 50)
    assert False, "Пустой госномер должен вызывать ValueError"
except ValueError:
    pass

try:
    Bus("123 AB 02", 5)  # Меньше 10
    assert False, "Вместимость < 10 должна вызывать ValueError"
except ValueError:
    pass

try:
    Bus("123 AB 02", 300)  # Больше 250
    assert False, "Вместимость > 250 должна вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 4: Валидация госномера и диапазона вместимости Bus [10; 250]")

# Привязка маршрута
bus.assign_route(route)
assert bus.route is route, "Маршрут должен быть успешно привязан"
try:
    bus.assign_route("Не маршрут")
    assert False, "Привязка не-Route должна вызывать TypeError"
except TypeError:
    pass
print("[OK] Test 5: Привязка маршрута assign_route с проверкой типов")

# Посадка пассажиров и защита вместимости
bus.board_passengers(30)
assert bus.current_passengers == 30, f"Ожидалось 30 пассажиров, получено {bus.current_passengers}"

try:
    bus.board_passengers(25)  # 30 + 25 = 55 > 50!
    assert False, "Превышение вместимости должно вызывать CapacityExceededError"
except CapacityExceededError:
    pass

assert bus.current_passengers == 30, "Число пассажиров не должно измениться при сбое посадки"
print("[OK] Test 6: Защита от переполнения салона (CapacityExceededError)")

# Высадка пассажиров
bus.leave_passengers(10)
assert bus.current_passengers == 20

try:
    bus.leave_passengers(25)  # Попытка высадить больше, чем есть
    assert False, "Высадка большего числа пассажиров должна вызывать ValueError"
except ValueError:
    pass

assert bus.current_passengers == 20
print("[OK] Test 7: Высадка пассажиров и защита от отрицательного остатка")

print("[OK] Все тесты первой практической задачи успешно пройдены! (+15 баллов)")
`,
  hints: [
    'В Route проверьте: not route_number or not route_number.strip() -> raise ValueError.',
    'Для проверки остановок: len(stops) < 2 или any(stops[i] == stops[i+1] for i in range(len(stops)-1)).',
    'В Bus capacity должна быть: not (10 <= capacity <= 250) -> raise ValueError.',
    'В board_passengers: если self._current_passengers + count > self._capacity, выбросите CapacityExceededError ДО изменения _current_passengers.',
  ],
};

export const week1HomeworkTask: CodeTask = {
  id: 'week-1-homework-card-ticket',
  title: 'Домашнее задание: TransitCard и электронный разовый билет SingleTripTicket',
  scorePoints: 10,
  descriptionMarkdown: `## Домашнее задание: Оплата проезда в Avtobys (Лабораторная №1, Блок 2)

Во второй задаче мы моделируем объектную систему оплаты проезда: транспортную карту (\`TransitCard\`) с защитой баланса и электронный разовый билет (\`SingleTripTicket\`).

---

### 1. Сущность \`TransitCard\` (Транспортная карта):
- **Исключения:**
  - \`InsufficientFundsError(Exception)\` — нехватка средств для оплаты.
  - \`CardBlockedError(Exception)\` — попытка операции с заблокированной картой.
- **Конструктор:** \`__init__(self, card_id: str, balance: Decimal = Decimal("0.00"), discount_rate: Decimal = Decimal("0.00"))\`
  - \`card_id\`: непустая строка (иначе \`ValueError\`).
  - \`balance\`: \`balance >= Decimal("0.00")\` (иначе \`ValueError\`).
  - \`discount_rate\`: в диапазоне \`[Decimal("0.00"), Decimal("1.00")]\` (0.0 — стандарт, 0.5 — студент, 1.0 — бесплатный) (иначе \`ValueError\`).
  - Статус блокировки: \`_is_blocked = False\`.
- **Свойства (Read-Only):**
  - \`@property card_id -> str\`
  - \`@property balance -> Decimal\`
  - \`@property discount_rate -> Decimal\`
  - \`@property is_blocked -> bool\`
- **Методы:**
  - \`top_up(self, amount: Decimal) -> None\`: пополнение карты. Если заблокирована — \`CardBlockedError\`. Минимальная сумма — **100.00 KZT** (если \`amount < Decimal("100.00")\` — \`ValueError\`).
  - \`pay(self, fare: Decimal) -> Decimal\`: оплата проезда с учетом скидки.
    - Если заблокирована — \`CardBlockedError\`.
    - \`fare > Decimal("0.00")\`, иначе \`ValueError\`.
    - Фактическая стоимость: \`effective_fare = fare * (Decimal("1.00") - self._discount_rate)\`.
    - Если \`self._balance < effective_fare\` — выбросить \`InsufficientFundsError\` (баланс не меняется!).
    - Списать \`effective_fare\` и вернуть списанную сумму.
  - \`block(self, reason: str = "") -> None\`: \`_is_blocked = True\`.
  - \`unblock(self) -> None\`: \`_is_blocked = False\`.

---

### 2. Сущность \`SingleTripTicket\` (Разовый билет):
Разовый билет приобретается по QR/SMS и имеет жесткий срок действия.
- **Исключения:**
  - \`TicketAlreadyUsedError(Exception)\` — билет уже был использован ранее.
  - \`TicketExpiredError(Exception)\` — истек 60-минутный срок действия билета.
- **Конструктор:** \`__init__(self, ticket_code: str, price: Decimal, issued_at: datetime)\`
  - \`ticket_code\`: непустая строка (иначе \`ValueError\`).
  - \`price\`: строго положительная сумма (\`price > Decimal("0.00")\`, иначе \`ValueError\`).
  - \`issued_at\`: объект \`datetime\` момента покупки.
  - Начальный статус валидации: \`_is_validated = False\`.
  - Начальный валидировавший автобус: \`_validated_bus = None\`.
- **Свойства (Read-Only):**
  - \`@property ticket_code -> str\`
  - \`@property price -> Decimal\`
  - \`@property issued_at -> datetime\`
  - \`@property is_validated -> bool\`
  - \`@property validated_bus -> Bus | None\`
- **Метод \`validate(self, bus: Bus, current_time: datetime) -> None\`:**
  - \`bus\` должен быть экземпляром \`Bus\` (иначе \`TypeError\`).
  - Если билет уже валидирован (\`self._is_validated is True\`) — выбросить \`TicketAlreadyUsedError\`.
  - Срок действия: если разница \`(current_time - self._issued_at).total_seconds() > 3600\` (более 60 минут) — выбросить \`TicketExpiredError\`.
  - При успехе: установить \`_is_validated = True\`, \`_validated_bus = bus\`.
`,
  starterCode: `from decimal import Decimal
from datetime import datetime, timedelta


class InsufficientFundsError(Exception):
    pass


class CardBlockedError(Exception):
    pass


class TicketAlreadyUsedError(Exception):
    pass


class TicketExpiredError(Exception):
    pass


class TransitCard:
    """
    Транспортная карта Avtobys с защитой баланса и скидок.
    """

    MIN_TOP_UP_AMOUNT = Decimal("100.00")

    def __init__(
        self,
        card_id: str,
        balance: Decimal = Decimal("0.00"),
        discount_rate: Decimal = Decimal("0.00")
    ):
        # TODO: Реализуйте валидацию card_id, balance, discount_rate
        pass

    @property
    def card_id(self) -> str:
        pass

    @property
    def balance(self) -> Decimal:
        pass

    @property
    def discount_rate(self) -> Decimal:
        pass

    @property
    def is_blocked(self) -> bool:
        pass

    def top_up(self, amount: Decimal) -> None:
        # TODO: Проверьте блокировку и минимальную сумму пополнения 100 KZT
        pass

    def pay(self, fare: Decimal) -> Decimal:
        # TODO: Проверьте блокировку, рассчитайте effective_fare,
        # проверьте нехватку средств и выполните списание. Верните списанную сумму.
        pass

    def block(self, reason: str = "") -> None:
        pass

    def unblock(self) -> None:
        pass


class SingleTripTicket:
    """
    Электронный разовый билет с ограничением по времени (60 минут) и защитой от повторной валидации.
    """

    VALIDITY_SECONDS = 3600

    def __init__(self, ticket_code: str, price: Decimal, issued_at: datetime):
        # TODO: Проверьте ticket_code, price > 0, сохраните issued_at
        # Инициализируйте _is_validated = False, _validated_bus = None
        pass

    @property
    def ticket_code(self) -> str:
        pass

    @property
    def price(self) -> Decimal:
        pass

    @property
    def issued_at(self) -> datetime:
        pass

    @property
    def is_validated(self) -> bool:
        pass

    @property
    def validated_bus:
        pass

    def validate(self, bus, current_time: datetime) -> None:
        # TODO: Проверьте, что bus имеет атрибут plate_number
        # Проверьте повторное использование (TicketAlreadyUsedError)
        # Проверьте срок действия (TicketExpiredError)
        # Установите статус валидации и привяжите автобус
        pass
`,
  testCode: `from decimal import Decimal
from datetime import datetime, timedelta

# --- 1. Тестирование TransitCard ---
card = TransitCard("KZ-100", Decimal("500.00"), Decimal("0.50"))
assert card.card_id == "KZ-100"
assert card.balance == Decimal("500.00")
assert card.discount_rate == Decimal("0.50")
assert card.is_blocked is False
print("[OK] Test 1: Инициализация TransitCard со студенческой скидкой 50%")

# Пополнение карты
card.top_up(Decimal("200.00"))
assert card.balance == Decimal("700.00")

try:
    card.top_up(Decimal("50.00"))  # Меньше 100
    assert False, "Пополнение меньше 100 KZT должно вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 2: Пополнение баланса с защитой минимальной суммы (100 KZT)")

# Оплата проезда с учетом скидки (тариф 100 KZT -> списание 50 KZT)
paid = card.pay(Decimal("100.00"))
assert paid == Decimal("50.00"), f"Ожидалось списание 50.00, получено {paid}"
assert card.balance == Decimal("650.00"), f"Остаток должен быть 650.00, получено {card.balance}"
print("[OK] Test 3: Оплата проезда pay() с расчетом льготного тарифа")

# Защита от отрицательного баланса
try:
    card.pay(Decimal("2000.00"))
    assert False, "Нехватка средств должна вызывать InsufficientFundsError"
except InsufficientFundsError:
    pass
assert card.balance == Decimal("650.00"), "Баланс не должен меняться при сбое списания"
print("[OK] Test 4: Защита от отрицательного баланса (InsufficientFundsError)")

# Блокировка карты
card.block("Утеряна")
assert card.is_blocked is True
try:
    card.pay(Decimal("50.00"))
    assert False, "Операция с заблокированной картой должна вызывать CardBlockedError"
except CardBlockedError:
    pass

card.unblock()
assert card.is_blocked is False
print("[OK] Test 5: Блокировка и разблокировка карты (CardBlockedError)")

# --- 2. Тестирование SingleTripTicket ---
class DummyBus:
    def __init__(self, plate):
        self.plate_number = plate

dummy_bus = DummyBus("777 KZ 02")
now = datetime(2026, 10, 10, 12, 0, 0)
ticket = SingleTripTicket("TCK-9999", Decimal("100.00"), now)

assert ticket.ticket_code == "TCK-9999"
assert ticket.is_validated is False
assert ticket.validated_bus is None
print("[OK] Test 6: Создание разового билета SingleTripTicket")

# Успешная валидация через 15 минут
valid_time = now + timedelta(minutes=15)
ticket.validate(dummy_bus, valid_time)
assert ticket.is_validated is True
assert ticket.validated_bus is dummy_bus
print("[OK] Test 7: Успешная валидация билета в автобусе")

# Повторная валидация того же билета
try:
    ticket.validate(dummy_bus, valid_time + timedelta(minutes=5))
    assert False, "Повторная валидация должна вызывать TicketAlreadyUsedError"
except TicketAlreadyUsedError:
    pass
print("[OK] Test 8: Защита от повторной валидации (TicketAlreadyUsedError)")

# Просроченный билет (> 60 минут)
expired_ticket = SingleTripTicket("TCK-OLD", Decimal("100.00"), now)
expired_time = now + timedelta(minutes=61)
try:
    expired_ticket.validate(dummy_bus, expired_time)
    assert False, "Валидация через 61 минуту должна вызывать TicketExpiredError"
except TicketExpiredError:
    pass
print("[OK] Test 9: Защита от использования просроченного билета (TicketExpiredError)")

print("[OK] Все тесты домашнего задания успешно пройдены! (+10 баллов)")
`,
  hints: [
    'В TransitCard: effective_fare = fare * (Decimal("1.00") - self._discount_rate).',
    'В SingleTripTicket.validate: проверьте hasattr(bus, "plate_number") или isinstance.',
    'Для проверки срока годности: (current_time - self._issued_at).total_seconds() > 3600 -> raise TicketExpiredError.',
    'Не забудьте проверить self._is_validated до валидации и выбросить TicketAlreadyUsedError.',
  ],
};
