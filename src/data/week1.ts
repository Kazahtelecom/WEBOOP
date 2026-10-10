import type { Lesson, CodeTask } from '../types/course';

export const week1Lecture: Lesson = {
  id: 'week-1-lecture',
  title: 'Лекция: Классы, объекты и инкапсуляция в Avtobys',
  durationMinutes: 45,
  contentMarkdown: `# Неделя 1: Классы, объекты и инкапсуляция

Добро пожаловать в первый учебный модуль курса по Объектно-Ориентированному Программированию (ООП)!
В течение курса мы будем разрабатывать архитектуру реальной платежной системы общественного транспорта **Avtobys**.

---

### 1. Проблема процедурного подхода и почему нужно ООП

В процедурном программировании данные и функции существуют раздельно. Представим, что мы описываем транспортную карту обычным словарем:

\`\`\`python
# Процедурный антипаттерн
card = {
    "card_id": "KZ-10029",
    "balance": 500.0,
    "is_blocked": False
}

def deduct_fare(card_dict, fare):
    card_dict["balance"] -= fare

# Любая часть системы может случайно нарушить состояние:
card["balance"] = -99999.0  # Отрицательный баланс!
deduct_fare(card, 100.0)    # Деньги списаны с заблокированной карты!
\`\`\`

**Проблемы процедурного подхода в биллинге:**
1. **Отсутствие защиты данных:** любой модуль может напрямую изменить \`balance\` или снять флаг блокировки.
2. **Размытая ответственность:** проверка инвариантов (хватает ли средств, не заблокирована ли карта) повторяется в десятках функций.
3. **Хрупкость при масштабировании:** изменение формата словаря ломает всю кодовую базу.

---

### 2. Что такое инвариант класса?

> **Инвариант класса (Class Invariant)** — это непреложное условие корректности состояния объекта, которое гарантированно выполняется после завершения конструктора и до/после вызова любого публичного метода.

Для сущности **Транспортная карта (TransitCard)** действуют следующие инварианты:
- **Баланс не может быть отрицательным:** \`balance >= 0.00\`.
- **Идентификатор карты не может быть пустой строкой.**
- **Скидка находится строго в диапазоне [0.0; 1.0].**
- **Минимальная сумма пополнения — 100 KZT.**
- **С заблокированной карты запрещены любые списания и пополнения.**

Объектно-ориентированный подход гарантирует: объект **невозможно** перевести в некорректное состояние извне.

---

### 3. Инкапсуляция и сокрытие данных в Python

Инкапсуляция объединяет данные и методы работы с ними в единую капсулу (класс) и скрывает детали реализации от внешнего мира.

В Python инкапсуляция строится на соглашениях и свойствах:
1. **Защищенные атрибуты (Protected):** префикс с одним подчеркиванием (например, \`self._balance\`). Это соглашение для программистов: «Это внутреннее состояние объекта, не изменяй его напрямую!».
2. **Приватные атрибуты (Private / Name Mangling):** префикс с двумя подчеркиваниями (например, \`self.__card_id\`). Python автоматически трансформирует имя в \`_ClassName__card_id\`, защищая от случайного переопределения в подклассах.
3. **Свойства (@property):** позволяют предоставлять публичный доступ для чтения без возможности неконтролируемой перезаписи извне.

\`\`\`python
class TransitCard:
    def __init__(self, card_id: str):
        self._card_id = card_id
        self._balance = Decimal("0.00")

    @property
    def balance(self) -> Decimal:
        """Публичный геттер: баланс доступен только для чтения снаружи."""
        return self._balance
\`\`\`

---

### 4. Принцип «Tell, Don't Ask» и антипаттерн Anemic Domain Model

Частая ошибка начинающих разработчиков — создание **анемичной модели предметной области (Anemic Domain Model)**: классов с одними лишь полями данных (мешок свойств), в то время как вся логика вынесена в процедурные сервисы.

\`\`\`python
# АНТИПАТТЕРН: Анемичный класс
class BadTransitCard:
    def __init__(self):
        self.balance = 0.0
        self.is_blocked = False

# Внешний сервис спрашивает состояние и меняет его сам (Ask, Then Act):
if card.balance >= fare and not card.is_blocked:
    card.balance -= fare  # Опасно! Ответственность размазана.
\`\`\`

#### Принцип «Tell, Don't Ask» (Приказывай, а не спрашивай):
Вместо того чтобы извлекать внутренности объекта, проверять их снаружи и перезаписывать, попросите объект выполнить действие самостоятельно:

\`\`\`python
# ПРАВИЛЬНО: Rich Domain Model (Tell, Don't Ask)
actual_fare = card.charge_fare(base_fare)
\`\`\`
Вся проверка баланса, учет скидки и списание инкапсулированы внутри метода \`charge_fare\`. Если средств недостаточно — метод выбрасывает \`InsufficientFundsError\`.

---

### 5. Точность финансовых расчетов: почему Decimal, а не float?

В Python стандартные числа с плавающей точкой (\`float\`) реализованы по стандарту двоичной арифметики IEEE 754:

\`\`\`python
>>> 0.1 + 0.2
0.30000000000000004
>>> 0.1 + 0.2 == 0.3
False
\`\`\`

В биллинговых системах, где совершаются миллионы транзакций, накопление таких погрешностей приводит к финансовым убыткам.
Поэтому в финансовых и доменных расчетах **всегда используется модуль \`decimal\`**:

\`\`\`python
from decimal import Decimal

balance = Decimal("100.00")
fare = Decimal("80.00")
remaining = balance - fare # Ровно Decimal('20.00')
\`\`\`

---

### 6. Доменные исключения (Domain Exceptions)

В надежной ООП-архитектуре при нарушении инвариантов выбрасываются специализированные доменные исключения, а не абстрактные ошибки:

\`\`\`python
class InsufficientFundsError(Exception):
    """Исключение при нехватке средств на карте."""
    pass

class CardBlockedError(Exception):
    """Исключение при попытке операции с заблокированной картой."""
    pass
\`\`\`
`,
  quickChecks: [
    {
      id: 'qc-1',
      question:
        'Зачем в Python принято использовать префикс с одним подчеркиванием (например, self._balance)?',
      options: [
        'Чтобы интерпретатор Python вызывал ошибку SyntaxError при любой попытке доступа',
        'Это общепринятое соглашение (convention), сигнализирующее, что атрибут является внутренней деталью реализации и защищен от прямого внешнего изменения',
        'Чтобы атрибут автоматически сохранялся в локальную базу данных',
        'Это специальный синтаксис для создания многопоточных защищенных переменных',
      ],
      correctOptionIndex: 1,
      explanation:
        'В Python нет аппаратного ключевого слова private на уровне CPython. Префикс с одним подчеркиванием — общепринятый стандарт инкапсуляции в сообществе Python (PEP 8), требующий обращаться к данным только через методы и свойства.',
    },
    {
      id: 'qc-2',
      question:
        'Почему для расчетов баланса в транспортной системе Avtobys строго необходим Decimal вместо float?',
      options: [
        'Потому что float работает медленнее при сложении',
        'Потому что числа float не поддерживают работу в браузере с Pyodide',
        'Числа float подвержены ошибкам двоичного округления (например, 0.1 + 0.2 != 0.3), что приводит к финансовым потерям в биллинге',
        'Потому что float не может хранить числа больше 1000',
      ],
      correctOptionIndex: 2,
      explanation:
        'Двоичный формат IEEE 754 не может точно представить многие десятичные дроби (например, 0.1 или 0.05). Класс Decimal реализует точную десятичную арифметику фиксированной точности, что является обязательным стандартом финтеха.',
    },
    {
      id: 'qc-3',
      question:
        'В чем заключается преимущество соблюдения принципа «Tell, Don’t Ask» (Приказывай, а не спрашивай)?',
      options: [
        'Объект сам управляет своими данными и защищает инварианты, вместо того чтобы внешний код вытаскивал данные и манипулировал ими',
        'Все функции должны быть написаны в императивном стиле без использования возвращаемых значений',
        'Класс должен содержать только сеттеры без методов чтения',
        'Пользователь должен всегда вводить команды через интерактивный терминал',
      ],
      correctOptionIndex: 0,
      explanation:
        'Принцип «Tell, Don’t Ask» защищает от антипаттерна «Анемичная модель». Объект сам выполняет операцию (например, card.charge_fare(fare)), проверяет блокировку и баланс, гарантируя целостность данных в одном месте.',
    },
    {
      id: 'qc-4',
      question: 'Что такое инвариант класса в ООП?',
      options: [
        'Функция, которая не может принимать аргументы',
        'Переменная, которую можно объявить только в глобальной области видимости',
        'Условие целостности состояния объекта, которое всегда должно быть истинным после конструктора и любого метода',
        'Специальный декоратор для ускорения выполнения кода',
      ],
      correctOptionIndex: 2,
      explanation:
        'Инвариант класса (например: balance >= 0, скидка в пределах 0..1) гарантирует, что объект никогда не окажется в испорченном или невалидном состоянии.',
    },
  ],
};

export const week1PracticeTask: CodeTask = {
  id: 'week-1-practice-transit-card',
  title: 'Практика: Класс TransitCard с защитой инвариантов',
  scorePoints: 15,
  descriptionMarkdown: `## Практическое задание: Класс TransitCard

Вам предстоит спроектировать богатую объектную модель (Rich Domain Model) транспортной карты системы **Avtobys**.

### Бизнес-требования и инварианты:

1. **Исключения предметной области:**
   - \`InsufficientFundsError(Exception)\` — выбрасывается при нехватке средств для списания.
   - \`CardBlockedError(Exception)\` — выбрасывается при любой попытке списания или пополнения заблокированной карты.

2. **Класс \`TransitCard\`:**
   - **Конструктор:** \`__init__(self, card_id: str, initial_balance: Decimal = Decimal("0.00"), discount_rate: Decimal = Decimal("0.00"))\`
     - \`card_id\`: непустая строка. Если строка пустая или состоит только из пробелов — выбросить \`ValueError\`.
     - \`initial_balance\`: неотрицательное число (\`initial_balance >= Decimal("0.00")\`). Иначе — выбросить \`ValueError\`.
     - \`discount_rate\`: коэффициент скидки в диапазоне \`[Decimal("0.00"), Decimal("1.00")]\` (0.0 — без скидки, 0.5 — студенческая 50%, 1.0 — бесплатный проезд). Иначе — выбросить \`ValueError\`.
     - Начальный статус блокировки: \`_is_blocked = False\`.
   - **Свойства (Read-Only Properties):**
     - \`@property card_id -> str\`
     - \`@property balance -> Decimal\`
     - \`@property discount_rate -> Decimal\`
     - \`@property is_blocked -> bool\`
   - **Метод \`top_up(self, amount: Decimal) -> None\`:**
     - Защита инварианта: если карта заблокирована, выбросить \`CardBlockedError\`.
     - Минимальная сумма пополнения — **100.00 KZT**. Если \`amount < Decimal("100.00")\`, выбросить \`ValueError\`.
     - Увеличивает баланс на переданную сумму.
   - **Метод \`charge_fare(self, base_fare: Decimal) -> Decimal\`:**
     - Если карта заблокирована, выбросить \`CardBlockedError\`.
     - Базовый тариф должен быть строго положительным (\`base_fare > Decimal("0.00")\`), иначе выбросить \`ValueError\`.
     - Рассчитать фактический тариф с учетом скидки:
       \`effective_fare = base_fare * (Decimal("1.00") - self._discount_rate)\`
     - Если на балансе недостаточно средств (\`self._balance < effective_fare\`), выбросить \`InsufficientFundsError\`. **При этом баланс карты не должен измениться!**
     - Списать \`effective_fare\` с баланса и вернуть списанную сумму.
   - **Методы управления блокировкой:**
     - \`block(self, reason: str = "") -> None\` — устанавливает \`_is_blocked = True\`.
     - \`unblock(self) -> None\` — устанавливает \`_is_blocked = False\`.
`,
  starterCode: `from decimal import Decimal


class InsufficientFundsError(Exception):
    """Исключение при нехватке средств на карте."""
    pass


class CardBlockedError(Exception):
    """Исключение при попытке операции с заблокированной картой."""
    pass


class TransitCard:
    """
    Транспортная карта платежной системы Avtobys.
    Гарантирует защиту бизнес-инвариантов баланса, скидок и статуса блокировки.
    """

    MIN_TOP_UP_AMOUNT = Decimal("100.00")

    def __init__(
        self,
        card_id: str,
        initial_balance: Decimal = Decimal("0.00"),
        discount_rate: Decimal = Decimal("0.00")
    ):
        # TODO: Реализуйте валидацию card_id, initial_balance, discount_rate
        # и сохраните защищенные атрибуты _card_id, _balance, _discount_rate, _is_blocked
        pass

    @property
    def card_id(self) -> str:
        # TODO: Верните идентификатор карты
        pass

    @property
    def balance(self) -> Decimal:
        # TODO: Верните текущий баланс карты
        pass

    @property
    def discount_rate(self) -> Decimal:
        # TODO: Верните персональную скидку
        pass

    @property
    def is_blocked(self) -> bool:
        # TODO: Верните статус блокировки
        pass

    def block(self, reason: str = "") -> None:
        # TODO: Установите флаг блокировки в True
        pass

    def unblock(self) -> None:
        # TODO: Установите флаг блокировки в False
        pass

    def top_up(self, amount: Decimal) -> None:
        # TODO: Проверьте блокировку и минимальную сумму пополнения, затем увеличьте баланс
        pass

    def charge_fare(self, base_fare: Decimal) -> Decimal:
        # TODO: Проверьте блокировку, валидность base_fare, рассчитайте effective_fare,
        # проверьте нехватку средств и выполните списание. Верните списанную сумму.
        pass
`,
  testCode: `from decimal import Decimal

# 1. Проверка инициализации и свойств
card = TransitCard("KZ-001", Decimal("500.00"), Decimal("0.20"))
assert card.card_id == "KZ-001", "Свойство card_id должно возвращать переданный ID"
assert card.balance == Decimal("500.00"), "Свойство balance должно возвращать начальный баланс"
assert card.discount_rate == Decimal("0.20"), "Свойство discount_rate должно возвращать скидку"
assert card.is_blocked is False, "Новая карта по умолчанию должна быть активна (is_blocked == False)"
print("[OK] Test 1: Инициализация карты и геттеры свойств")

# 2. Валидация входных параметров в конструкторе
try:
    TransitCard("", Decimal("100.00"))
    assert False, "Пустой card_id должен вызывать ValueError"
except ValueError:
    pass

try:
    TransitCard("KZ-002", Decimal("-50.00"))
    assert False, "Отрицательный баланс должен вызывать ValueError"
except ValueError:
    pass

try:
    TransitCard("KZ-003", Decimal("0.00"), Decimal("1.50"))
    assert False, "Скидка больше 1.0 должна вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 2: Защита инвариантов в конструкторе (ValueError)")

# 3. Пополнение баланса (top_up)
card.top_up(Decimal("200.00"))
assert card.balance == Decimal("700.00"), f"Баланс после пополнения должен быть 700.00, получено {card.balance}"

try:
    card.top_up(Decimal("50.00")) # Меньше минимальных 100 KZT
    assert False, "Пополнение меньше 100 KZT должно вызывать ValueError"
except ValueError:
    pass
assert card.balance == Decimal("700.00"), "Баланс не должен меняться при отклоненном пополнении"
print("[OK] Test 3: Пополнение баланса и проверка минимальной суммы (100 KZT)")

# 4. Списание за проезд с учетом скидки (charge_fare)
# Базовый тариф 100.00 KZT, скидка 20% -> списание 80.00 KZT
charged = card.charge_fare(Decimal("100.00"))
assert charged == Decimal("80.00"), f"Списано должно быть 80.00 KZT, получено {charged}"
assert card.balance == Decimal("620.00"), f"Остаток на карте должен быть 620.00 KZT, получено {card.balance}"
print("[OK] Test 4: Корректное списание проезда с учетом скидки")

# 5. Проверка нехватки средств (InsufficientFundsError)
small_card = TransitCard("KZ-SMALL", Decimal("50.00"))
try:
    small_card.charge_fare(Decimal("100.00"))
    assert False, "Списание при нехватке средств должно вызывать InsufficientFundsError"
except InsufficientFundsError:
    pass
assert small_card.balance == Decimal("50.00"), "Баланс не должен уменьшаться при ошибке нехватки средств"
print("[OK] Test 5: Защита от отрицательного баланса (InsufficientFundsError)")

# 6. Блокировка и разблокировка карты
card.block("Утеря карты")
assert card.is_blocked is True, "Карта должна иметь статус is_blocked == True"

try:
    card.charge_fare(Decimal("100.00"))
    assert False, "Списание с заблокированной карты должно вызывать CardBlockedError"
except CardBlockedError:
    pass

try:
    card.top_up(Decimal("500.00"))
    assert False, "Пополнение заблокированной карты должно вызывать CardBlockedError"
except CardBlockedError:
    pass

card.unblock()
assert card.is_blocked is False, "Карта должна разблокироваться после unblock()"
card.top_up(Decimal("100.00"))
assert card.balance == Decimal("720.00"), "После разблокировки операции должны успешно выполняться"
print("[OK] Test 6: Управление блокировкой и запрет операций с заблокированной картой")

print("[OK] Все тесты пройдены! (+15 баллов)")
`,
  hints: [
    'В конструкторе проверьте: not card_id or not card_id.strip() -> raise ValueError(...)',
    'Для расчета списания с учетом скидки: effective_fare = base_fare * (Decimal("1.00") - self._discount_rate)',
    'Не забудьте проверить self._is_blocked в начале методов top_up и charge_fare и выбросить CardBlockedError.',
    'Если self._balance < effective_fare, выбросите InsufficientFundsError до модификации _balance.',
  ],
};

export const week1HomeworkTask: CodeTask = {
  id: 'week-1-homework-passenger',
  title: 'Домашнее задание: Сущность Passenger и привязка карт',
  scorePoints: 10,
  descriptionMarkdown: `## Домашнее задание: Сущность Passenger и привязка карт

Во второй задаче мы моделируем сущность **Пассажир (Passenger)**, который пользуется транспортной картой **TransitCard**.

### Бизнес-требования:

1. **Класс \`Passenger\`:**
   - **Конструктор:** \`__init__(self, passenger_id: str, full_name: str, card: TransitCard | None = None)\`
     - \`passenger_id\` и \`full_name\`: непустые строки (иначе выбросить \`ValueError\`).
     - \`card\`: опциональный объект карты. Если передан — привязать через метод \`link_card(card)\`.
   - **Свойства (Read-Only Properties):**
     - \`@property passenger_id -> str\`
     - \`@property full_name -> str\`
     - \`@property card -> TransitCard | None\`
   - **Метод \`link_card(self, card: TransitCard) -> None\`:**
     - Проверить, что \`card\` является экземпляром \`TransitCard\` (иначе выбросить \`TypeError\`).
     - Если передаваемая карта заблокирована (\`card.is_blocked\`), привязка запрещена — выбросить \`CardBlockedError\`.
     - Сохранить карту в \`_card\`.
   - **Метод \`unlink_card(self) -> None\`:**
     - Отвязать текущую карту (\`self._card = None\`).
   - **Метод \`pay_trip(self, base_fare: Decimal) -> Decimal\`:**
     - Если карта не привязана (\`self._card is None\`), выбросить \`ValueError("У пассажира нет привязанной карты")\`.
     - Делегировать списание карте: вызвать \`self._card.charge_fare(base_fare)\`.
     - Вернуть фактически списанную сумму.

*Класс \`TransitCard\` и исключения из предыдущей задачи уже включены в шаблон кода.*
`,
  starterCode: `from decimal import Decimal


class InsufficientFundsError(Exception):
    pass


class CardBlockedError(Exception):
    pass


class TransitCard:
    MIN_TOP_UP_AMOUNT = Decimal("100.00")

    def __init__(
        self,
        card_id: str,
        initial_balance: Decimal = Decimal("0.00"),
        discount_rate: Decimal = Decimal("0.00")
    ):
        if not card_id or not card_id.strip():
            raise ValueError("ID карты не может быть пустым")
        if initial_balance < Decimal("0.00"):
            raise ValueError("Баланс не может быть отрицательным")
        if discount_rate < Decimal("0.00") or discount_rate > Decimal("1.00"):
            raise ValueError("Скидка должна быть в [0.0; 1.0]")
        self._card_id = card_id.strip()
        self._balance = initial_balance
        self._discount_rate = discount_rate
        self._is_blocked = False

    @property
    def card_id(self) -> str:
        return self._card_id

    @property
    def balance(self) -> Decimal:
        return self._balance

    @property
    def discount_rate(self) -> Decimal:
        return self._discount_rate

    @property
    def is_blocked(self) -> bool:
        return self._is_blocked

    def block(self, reason: str = "") -> None:
        self._is_blocked = True

    def unblock(self) -> None:
        self._is_blocked = False

    def top_up(self, amount: Decimal) -> None:
        if self._is_blocked:
            raise CardBlockedError("Карта заблокирована")
        if amount < self.MIN_TOP_UP_AMOUNT:
            raise ValueError("Минимум 100 KZT")
        self._balance += amount

    def charge_fare(self, base_fare: Decimal) -> Decimal:
        if self._is_blocked:
            raise CardBlockedError("Карта заблокирована")
        if base_fare <= Decimal("0.00"):
            raise ValueError("Тариф должен быть > 0")
        effective = base_fare * (Decimal("1.00") - self._discount_rate)
        if self._balance < effective:
            raise InsufficientFundsError("Недостаточно средств")
        self._balance -= effective
        return effective


class Passenger:
    """
    Пассажир транспортной системы Avtobys.
    Управляет привязанной картой и оплатой поездок.
    """

    def __init__(self, passenger_id: str, full_name: str, card: TransitCard | None = None):
        # TODO: Проверьте валидность passenger_id и full_name (не пустые строки)
        # Сохраните _passenger_id, _full_name, _card
        # Если передан card, используйте self.link_card(card)
        pass

    @property
    def passenger_id(self) -> str:
        # TODO: Верните ID пассажира
        pass

    @property
    def full_name(self) -> str:
        # TODO: Верните ФИО пассажира
        pass

    @property
    def card(self) -> TransitCard | None:
        # TODO: Верните привязанную карту
        pass

    def link_card(self, card: TransitCard) -> None:
        # TODO: Проверьте isinstance(card, TransitCard) (TypeError)
        # и card.is_blocked (CardBlockedError). Привяжите карту.
        pass

    def unlink_card(self) -> None:
        # TODO: Отвяжите карту (установите self._card = None)
        pass

    def pay_trip(self, base_fare: Decimal) -> Decimal:
        # TODO: Если self._card is None -> raise ValueError
        # Делегируйте списание карте через self._card.charge_fare(base_fare)
        pass
`,
  testCode: `from decimal import Decimal

# 1. Проверка создания пассажира
p1 = Passenger("P-101", "Алихан Смаилов")
assert p1.passenger_id == "P-101", "passenger_id должен возвращать переданный ID"
assert p1.full_name == "Алихан Смаилов", "full_name должен возвращать переданное имя"
assert p1.card is None, "По умолчанию у пассажира нет привязанной карты (None)"
print("[OK] Test 1: Инициализация пассажира без карты")

# 2. Валидация входных данных
try:
    Passenger("", "Иван")
    assert False, "Пустой passenger_id должен вызывать ValueError"
except ValueError:
    pass

try:
    Passenger("P-102", "   ")
    assert False, "Пустое имя passenger_name должно вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 2: Валидация параметров конструктора Passenger (ValueError)")

# 3. Попытка оплаты без привязанной карты
try:
    p1.pay_trip(Decimal("100.00"))
    assert False, "Поездка без карты должна вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 3: Отказ в поездке без привязанной карты")

# 4. Привязка карты и успешная оплата поездки
card = TransitCard("KZ-999", Decimal("500.00"), Decimal("0.50")) # Студенческая карта 50%
p1.link_card(card)
assert p1.card is card, "Карта должна успешно привязаться к пассажиру"

# Оплата поездки: тариф 100 KZT со скидкой 50% = 50 KZT
cost = p1.pay_trip(Decimal("100.00"))
assert cost == Decimal("50.00"), f"Стоимость поездки должна быть 50.00 KZT, получено {cost}"
assert card.balance == Decimal("450.00"), f"Остаток на карте должен быть 450.00 KZT, получено {card.balance}"
print("[OK] Test 4: Успешная привязка карты и оплата поездки со скидкой")

# 5. Отвязка карты (unlink_card)
p1.unlink_card()
assert p1.card is None, "После unlink_card() карта должна быть None"
try:
    p1.pay_trip(Decimal("100.00"))
    assert False, "После отвязки карты оплата должна быть невозможна"
except ValueError:
    pass
print("[OK] Test 5: Отвязка карты и проверка блокировки оплаты")

# 6. Запрет привязки заблокированной карты
blocked_card = TransitCard("KZ-BLOCKED", Decimal("1000.00"))
blocked_card.block("Украдена")
try:
    p1.link_card(blocked_card)
    assert False, "Привязка заблокированной карты должна вызывать CardBlockedError"
except CardBlockedError:
    pass
assert p1.card is None, "Заблокированная карта не должна привязаться"
print("[OK] Test 6: Запрет привязки заблокированной карты (CardBlockedError)")

# 7. Защита типа при привязке (TypeError)
try:
    p1.link_card("не_объект_карты") # type: ignore
    assert False, "Привязка некорректного типа должна вызывать TypeError"
except TypeError:
    pass
print("[OK] Test 7: Проверка типа объекта при привязке карты (TypeError)")

print("[OK] Все тесты пройдены! (+10 баллов)")
`,
  hints: [
    'В методе link_card(self, card): проверьте isinstance(card, TransitCard) -> TypeError, и if card.is_blocked: raise CardBlockedError(...)',
    'В методе pay_trip(self, base_fare): если self._card is None, вызовите raise ValueError("У пассажира нет карты")',
    'Для делегирования оплаты вызовите: return self._card.charge_fare(base_fare)',
  ],
};
