import type { Lesson, CodeTask } from '../types/course';

export const week3Lecture: Lesson = {
  id: 'week-3-lecture',
  title: 'Лекция: Полиморфизм, утиная типизация и протоколы (typing.Protocol)',
  durationMinutes: 45,
  contentMarkdown: `# Неделя 3: Полиморфизм, утиная типизация и протоколы (typing.Protocol)

Добро пожаловать в заключительный модуль теоретической части курса! На этой неделе мы объединим знания об инкапсуляции и композиции в третьем столпе ООП — **Полиморфизме**.

Мы разберем, как избавиться от хрупких каскадов \`if/elif isinstance(...)\`, как работает утиная типизация в Python и как использовать современные статические контракты \`typing.Protocol\`.

---

### 1. Что такое полиморфизм в ООП?

> **Полиморфизм (Polymorphism)** — способность программного компонента единообразно взаимодействовать с объектами различных типов, при условии, что они реализуют общий контракт или поведение.

В классических статически типизированных языках (Java, C++) полиморфизм требует общего класса-предка или интерфейса. В Python полиморфизм существует на двух уровнях:
1. **Динамический полиморфизм (Утиная типизация / Duck Typing)** в рантайме.
2. **Структурный статический полиморфизм (\`typing.Protocol\`)** на этапе статического анализа (PEP 544).

---

### 2. «Утиная типизация» (Duck Typing)

> *«Если это выглядит как утка, плавает как утка и крякает как утка, то это, вероятно, и есть утка.»*

В Python тип объекта определяется **не его родословной (наследованием)**, а **набором его методов и атрибутов**.

\`\`\`python
# Внешнему валидатору не важно, какой класс перед ним.
# Главное — наличие метода process_payment(amount: Decimal):
class ValidatorDevice:
    def validate_ride(self, payment_method, amount: Decimal):
        # Tell, Don't Ask: просто вызываем контракт
        receipt = payment_method.process_payment(amount)
        return receipt
\`\`\`

Любой объект, у которого есть метод \`process_payment(amount)\`, может быть передан в \`validate_ride\`: карта Avtobys, Kaspi QR, Apple Pay или тестовый mock-объект.

---

### 3. Антипаттерн: Каскады проверки типов (Type Checking Cascades)

Главный враг полиморфизма — попытка проверять конкретный тип объекта через \`isinstance\` или \`type()\`:

\`\`\`python
# АНТИПАТТЕРН: Хрупкий процедурный диспетчер
def process(payment):
    if isinstance(payment, TransitCardPayment):
        payment.deduct_from_card()
    elif isinstance(payment, QRPayment):
        payment.scan_qr_token()
    elif isinstance(payment, NfcPayment):
        payment.authorize_contactless()
    # При добавлении 4-го способа оплаты придется переписывать этот код!
\`\`\`

**Почему это плохо?**
- Нарушается **Open/Closed Principle (OCP)**: класс валидатора открыт для модификации при каждом добавлении нового способа оплаты.
- Жесткая связанность (*Tight Coupling*): валидатор обязан знать все существующие способы оплаты в системе.

**Полиморфное решение:**
Все способы оплаты реализуют единый метод: \`process_payment(amount)\`. Валидатор вызывает его в одну строку:
\`\`\`python
receipt = payment.process_payment(amount)
\`\`\`

---

### 4. Статические протоколы: \`typing.Protocol\` (PEP 544)

В современном Python стандартом объявления контрактов является \`typing.Protocol\` — так называемая **структурная подтипизация (Structural Subtyping)**.

В отличие от \`abc.ABC\`, при использовании \`Protocol\` классам-реализациям **не требуется явно наследоваться** от протокола! Достаточно реализовать совпадающую сигнатуру метода:

\`\`\`python
from typing import Protocol
from decimal import Decimal

class PaymentMethod(Protocol):
    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        """Обработать платеж и вернуть квитанцию."""
        ...
\`\`\`

Если класс \`QRPayment\` имеет метод \`process_payment(self, amount: Decimal) -> PaymentReceipt\`, система типов и интерпретатор автоматически считают его полноценным \`PaymentMethod\`.

---

### 5. Архитектура терминала Avtobys (Сборка системы)

В нашей сквозной модели автобуса \`ValidatorDevice\`:
1. Хранит ссылку на маршрут/автобус и калькулятор тарифов \`FareCalculator\` (Неделя 2).
2. Вычисляет тариф с учетом зон и льгот.
3. Принимает любой \`PaymentMethod\` и полиморфно списывает оплату.
4. Выдает неизменяемую квитанцию \`PaymentReceipt\`.
`,
  quickChecks: [
    {
      id: 'w3-qc-1',
      question: 'В чем суть принципа утиной типизации (Duck Typing) в Python?',
      options: [
        'Все классы должны наследоваться от базового класса Duck',
        'Поведение и возможности объекта определяются наличием нужных методов и атрибутов, а не явным наследованием от конкретного класса',
        'Python компилирует программы исключительно во время запуска',
        'Имена методов обязаны начинаться со слова duck_',
      ],
      correctOptionIndex: 1,
      explanation:
        'Утиная типизация означает, что код работает с объектом на основе поддерживаемого им интерфейса (набора методов), независимо от его формального типа.',
    },
    {
      id: 'w3-qc-2',
      question: 'Почему каскады `if isinstance(obj, TypeA): ... elif isinstance(obj, TypeB): ...` считаются антипаттерном в ООП?',
      options: [
        'Они нарушают принцип открытости/закрытости (OCP), требуют постоянного переписывания при появлении новых типов и разрушают полиморфизм',
        'Инструкция isinstance запрещена спецификацией Python 3',
        'Они занимают слишком много оперативной памяти',
        'Интерпретатор Python выдает SyntaxError при цепочке elif длиннее двух условий',
      ],
      correctOptionIndex: 0,
      explanation:
        'Проверка конкретных типов через isinstance делает код жестко связанным. Правильный ООП-подход — полиморфный вызов одного метода у всех объектов.',
    },
    {
      id: 'w3-qc-3',
      question: 'Чем `typing.Protocol` (структурная типизация) отличается от классического `abc.ABC`?',
      options: [
        'Protocol работает только с целыми числами',
        'Классам не требуется явно наследоваться от Protocol: достаточно просто реализовать соответствующие методы с нужными сигнатурами',
        'abc.ABC нельзя использовать в функциях',
        'Protocol не поддерживается библиотекой mypy',
      ],
      correctOptionIndex: 1,
      explanation:
        'Protocol реализует структурную типизацию (duck typing на этапе проверки типов): любой класс с нужными методами автоматически совместим с протоколом без явного наследования.',
    },
    {
      id: 'w3-qc-4',
      question: 'Какую роль выполняет класс-квитанция `PaymentReceipt` в архитектуре валидатора?',
      options: [
        'Удаляет запись о платеже из базы данных',
        'Является стандартизированным объектом результата (Result Object), фиксирующим статус, сумму и время операции',
        'Заменяет собой интерпретатор Python',
        'Хранит только пароли пользователей',
      ],
      correctOptionIndex: 1,
      explanation:
        'PaymentReceipt стандартизирует результат полиморфного вызова, позволяя клиентскому коду единообразно проверять успех списания и детали чека.',
    },
  ],
};

export const week3PracticeTask: CodeTask = {
  id: 'week-3-practice-polymorphic-payments',
  title: 'Практика: Протокол PaymentMethod и полиморфный ValidatorDevice',
  scorePoints: 15,
  descriptionMarkdown: `## Практическое задание: Полиморфный прием платежей в Avtobys

Вам предстоит спроектировать полиморфную подсистему оплаты проезда для валидатора **Avtobys**, принимающую транспортные карты и QR-платежи через единый контракт без проверок \`isinstance\`.

---

### 1. Доменная сущность \`PaymentReceipt\` (Квитанция):
- **Конструктор:** \`__init__(self, receipt_id: str, amount: Decimal, payment_method: str, is_success: bool, error_message: str = "")\`
  - \`receipt_id\`: непустая строка. Иначе \`ValueError\`.
  - \`amount\`: сумма списания (\`Decimal >= Decimal("0.00")\`). Иначе \`ValueError\`.
  - \`payment_method\`: название способа оплаты (например, \`"TRANSIT_CARD"\`, \`"QR"\`).
  - \`is_success\`: логический статус успеха транзакции.
  - \`error_message\`: текст ошибки при неудаче (по умолчанию пустая строка).
- **Свойства (Read-Only):**
  - \`receipt_id\`, \`amount\`, \`payment_method\`, \`is_success\`, \`error_message\`.

---

### 2. Способы оплаты (Реализация протокола \`PaymentMethod\`):
Каждый класс реализует метод:
\`\`\`python
def process_payment(self, amount: Decimal) -> PaymentReceipt:
    ...
\`\`\`

1. **\`CardPayment\`** (Оплата транспортной картой):
   - Конструктор: \`__init__(self, card_id: str, balance: Decimal)\`
   - \`card_id\`: непустая строка (иначе \`ValueError\`).
   - \`balance\`: неотрицательный (\`Decimal >= Decimal("0.00")\`, иначе \`ValueError\`).
   - Метод \`process_payment(self, amount: Decimal) -> PaymentReceipt\`:
     - Если \`self._balance >= amount\`:
       - Списать \`amount\` с \`_balance\`.
       - Вернуть \`PaymentReceipt(receipt_id=f"RCP-CARD-{self._card_id}", amount=amount, payment_method="TRANSIT_CARD", is_success=True)\`.
     - Если средств недостаточно:
       - Баланс не меняется.
       - Вернуть \`PaymentReceipt(receipt_id=f"RCP-CARD-{self._card_id}", amount=Decimal("0.00"), payment_method="TRANSIT_CARD", is_success=False, error_message="Недостаточно средств")\`.

2. **\`QRPayment\`** (Оплата динамическим QR-кодом):
   - Конструктор: \`__init__(self, qr_token: str, user_balance: Decimal, is_active: bool = True)\`
   - Метод \`process_payment(self, amount: Decimal) -> PaymentReceipt\`:
     - Если QR не активен (\`not self._is_active\`):
       - Вернуть \`is_success=False, error_message="QR-код недействителен"\`.
     - Если \`self._user_balance < amount\`:
       - Вернуть \`is_success=False, error_message="Недостаточно средств на счете QR"\`.
     - Иначе:
       - Списать сумму, деактивировать QR (\`self._is_active = False\` — защита от повторного использования токена!).
       - Вернуть \`PaymentReceipt(receipt_id=f"RCP-QR-{self._qr_token}", amount=amount, payment_method="QR", is_success=True)\`.

---

### 3. Валидатор \`ValidatorDevice\` (Полиморфный контекст):
- **Конструктор:** \`__init__(self, device_id: str)\`
  - \`device_id\`: непустая строка (иначе \`ValueError\`).
  - Внутренний журнал успешных квитанций: \`_transactions = []\`.
- **Свойства:**
  - \`@property device_id -> str\`
  - \`@property transactions -> list[PaymentReceipt]\` (возвращает копию списка).
- **Полиморфный метод валидации поездки:**
  - \`validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt\`:
    - Проверка наличия метода: \`if not hasattr(payment_method, "process_payment"):\` -> выбросить \`TypeError("Объект не реализует протокол PaymentMethod")\`.
    - **Полиморфный вызов без isinstance:** \`receipt = payment_method.process_payment(fare)\`.
    - Если \`receipt.is_success\`:
      - Добавить \`receipt\` в \`self._transactions\`.
    - Вернуть полученный \`receipt\`.
`,
  starterCode: `from decimal import Decimal
from typing import Protocol

# 1. Квитанция об оплате
class PaymentReceipt:
    def __init__(
        self,
        receipt_id: str,
        amount: Decimal,
        payment_method: str,
        is_success: bool,
        error_message: str = ""
    ):
        # TODO: Проверьте инварианты и сохраните в приватные атрибуты
        pass

    @property
    def receipt_id(self) -> str:
        pass

    @property
    def amount(self) -> Decimal:
        pass

    @property
    def payment_method(self) -> str:
        pass

    @property
    def is_success(self) -> bool:
        pass

    @property
    def error_message(self) -> str:
        pass

# 2. Протокол способа оплаты
class PaymentMethod(Protocol):
    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        ...

# 3. Реализации платежей
class CardPayment:
    def __init__(self, card_id: str, balance: Decimal):
        # TODO: Инициализация с проверкой инвариантов
        pass

    @property
    def balance(self) -> Decimal:
        pass

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        # TODO: Проверка баланса, списание и формирование квитанции
        pass

class QRPayment:
    def __init__(self, qr_token: str, user_balance: Decimal, is_active: bool = True):
        # TODO: Инициализация QR
        pass

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        # TODO: Проверка активности токена, списание, одноразовая деактивация
        pass

# 4. Полиморфный терминал-валидатор
class ValidatorDevice:
    def __init__(self, device_id: str):
        # TODO: Инициализация с пустым журналом транзакций
        pass

    @property
    def device_id(self) -> str:
        pass

    @property
    def transactions(self) -> list[PaymentReceipt]:
        pass

    def validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt:
        # TODO: Полиморфный вызов process_payment БЕЗ isinstance проверок конкретных классов!
        pass
`,
  testCode: `from decimal import Decimal

# --- Тест 1: Валидация PaymentReceipt ---
r_ok = PaymentReceipt("R-1", Decimal("100.00"), "CARD", True)
assert r_ok.receipt_id == "R-1"
assert r_ok.amount == Decimal("100.00")
assert r_ok.is_success is True
assert r_ok.error_message == ""

try:
    PaymentReceipt("", Decimal("100.00"), "CARD", True)
    assert False, "Пустой receipt_id должен вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 1: Валидация сущности PaymentReceipt")

# --- Тест 2: Оплата картой CardPayment ---
card = CardPayment("KZ-444", Decimal("300.00"))
assert card.balance == Decimal("300.00")

# Успешная оплата 100 KZT
rcp1 = card.process_payment(Decimal("100.00"))
assert rcp1.is_success is True
assert rcp1.amount == Decimal("100.00")
assert card.balance == Decimal("200.00")

# Попытка оплаты 500 KZT (Нехватка средств)
rcp_fail = card.process_payment(Decimal("500.00"))
assert rcp_fail.is_success is False
assert "Недостаточно средств" in rcp_fail.error_message
assert card.balance == Decimal("200.00"), "Баланс не должен уменьшаться при отказе"
print("[OK] Test 2: CardPayment корректно списывает средства и защищает баланс")

# --- Тест 3: Оплата по QR (QRPayment) с одноразовым токеном ---
qr = QRPayment("TOKEN-ABC-123", Decimal("500.00"))
rcp_qr = qr.process_payment(Decimal("100.00"))
assert rcp_qr.is_success is True
assert rcp_qr.payment_method == "QR"

# Повторная попытка оплаты по тому же QR (должен быть деактивирован)
rcp_qr_reuse = qr.process_payment(Decimal("100.00"))
assert rcp_qr_reuse.is_success is False
assert "недействителен" in rcp_qr_reuse.error_message
print("[OK] Test 3: QRPayment успешно списывает и деактивирует одноразовый токен")

# --- Тест 4: Полиморфный прием в ValidatorDevice без isinstance ---
validator = ValidatorDevice("VAL-BUS-01")
assert validator.device_id == "VAL-BUS-01"
assert len(validator.transactions) == 0

# Оплата картой через валидатор
card2 = CardPayment("KZ-777", Decimal("200.00"))
res_card = validator.validate_ride(card2, Decimal("100.00"))
assert res_card.is_success is True
assert len(validator.transactions) == 1

# Оплата QR через тот же валидатор без модификации его кода
qr2 = QRPayment("TOKEN-XYZ-999", Decimal("200.00"))
res_qr = validator.validate_ride(qr2, Decimal("100.00"))
assert res_qr.is_success is True
assert len(validator.transactions) == 2

# Проверка, что неудачные платежи не засоряют журнал успешных транзакций
empty_card = CardPayment("KZ-EMPTY", Decimal("10.00"))
res_fail = validator.validate_ride(empty_card, Decimal("100.00"))
assert res_fail.is_success is False
assert len(validator.transactions) == 2, "Неуспешная транзакция не должна добавляться в журнал"

# Проверка объекта, не поддерживающего протокол (TypeError)
try:
    validator.validate_ride("строка_не_платеж", Decimal("100.00"))
    assert False, "Объект без process_payment должен вызывать TypeError"
except TypeError:
    pass
print("[OK] Test 4: Полиморфный диспетчер ValidatorDevice успешно обслуживает разные способы оплаты")

print("[OK] Все тесты первой практической задачи Недели 3 успешно пройдены! (+15 баллов)")
`,
  hints: [
    'В ValidatorDevice.validate_ride: проверьте not hasattr(payment_method, "process_payment") -> raise TypeError.',
    'Затем вызовите receipt = payment_method.process_payment(fare). Если receipt.is_success -> self._transactions.append(receipt).',
    'В QRPayment.process_payment: при первой успешной оплате установите self._is_active = False.',
  ],
};

export const week3HomeworkTask: CodeTask = {
  id: 'week-3-homework-mock-resilience',
  title: 'Домашнее задание: Mock-тестирование, оплата наличными и аудит отказов',
  scorePoints: 10,
  descriptionMarkdown: `## Домашнее задание: Расширение способов оплаты и аудит отказов

В реальной эксплуатации терминалы **Avtobys** сталкиваются с нестабильной связью, поврежденными картами и необходимостью принимать наличные через интерфейс водителя.

Вам предстоит добавить новый способ оплаты, создать инструмент стресс-тестирования (\`MockFailingPayment\`) и оснастить валидатор счетчиком отказов.

---

### 1. Способ оплаты наличными (\`CashPayment\`):
Водитель принимает наличные и валидатор печатает бумажный фискальный билет.
- Конструктор: \`__init__(self, cash_tendered: Decimal)\`
  - \`cash_tendered\`: сумма, внесенная пассажиром (\`Decimal > Decimal("0.00")\`).
- Метод \`process_payment(self, amount: Decimal) -> PaymentReceipt\`:
  - Если \`self._cash_tendered < amount\`:
    - Вернуть \`is_success=False, error_message="Внесенной суммы недостаточно для оплаты тарифа"\`.
  - Иначе:
    - Вычислить сдачу: \`change = self._cash_tendered - amount\`.
    - Вернуть \`PaymentReceipt(receipt_id=f"RCP-CASH-{int(amount)}", amount=amount, payment_method="CASH", is_success=True, error_message=f"Сдача: {change}")\`.

---

### 2. Тестовый мок сбоя (\`MockFailingPayment\`):
Специальный класс для тестирования отказоустойчивости системы (Chaos Engineering):
- Конструктор: \`__init__(self, failure_reason: str = "Сетевой таймаут банковского шлюза")\`
- Метод \`process_payment(self, amount: Decimal) -> PaymentReceipt\`:
  - Всегда возвращает \`PaymentReceipt(receipt_id="RCP-MOCK-FAIL", amount=Decimal("0.00"), payment_method="MOCK_FAIL", is_success=False, error_message=self._failure_reason)\`.

---

### 3. Расширенный терминал \`AuditedValidatorDevice\`:
Наследует или расширяет \`ValidatorDevice\`:
- **Поля:**
  - \`device_id: str\`
  - \`_transactions = []\` (успешные чеки)
  - \`_failed_attempts = 0\` (счетчик зарегистрированных отказов)
- **Свойства (Read-Only):**
  - \`@property failed_attempts_count -> int\`
  - \`@property total_revenue -> Decimal\` (суммарная выручка по всем успешным транзакциям в \`Decimal\`).
- **Метод \`validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt\`:**
  - Вызывает \`payment_method.process_payment(fare)\`.
  - Если платеж успешен:
    - Добавить в \`_transactions\`.
  - Если платеж не успешен (\`not receipt.is_success\`):
    - Увеличить \`self._failed_attempts += 1\`.
  - Вернуть \`receipt\`.
`,
  starterCode: `from decimal import Decimal
from typing import Protocol

# Используйте базовый PaymentReceipt из практики
class PaymentReceipt:
    def __init__(
        self,
        receipt_id: str,
        amount: Decimal,
        payment_method: str,
        is_success: bool,
        error_message: str = ""
    ):
        self._receipt_id = receipt_id
        self._amount = amount
        self._payment_method = payment_method
        self._is_success = is_success
        self._error_message = error_message

    @property
    def receipt_id(self) -> str:
        return self._receipt_id

    @property
    def amount(self) -> Decimal:
        return self._amount

    @property
    def payment_method(self) -> str:
        return self._payment_method

    @property
    def is_success(self) -> bool:
        return self._is_success

    @property
    def error_message(self) -> str:
        return self._error_message

# 1. Способ оплаты наличными
class CashPayment:
    def __init__(self, cash_tendered: Decimal):
        # TODO: Проверка суммы наличных
        pass

    @property
    def cash_tendered(self) -> Decimal:
        pass

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        # TODO: Расчет сдачи и генерация фискального чека CASH
        pass

# 2. Мок сбоя для тестирования отказов
class MockFailingPayment:
    def __init__(self, failure_reason: str = "Сетевой таймаут банковского шлюза"):
        # TODO: Сохраните причину отказа
        pass

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        # TODO: Всегда возвращает неуспешный PaymentReceipt с указанной причиной
        pass

# 3. Валидатор с аудитом отказов и подсчетом выручки
class AuditedValidatorDevice:
    def __init__(self, device_id: str):
        # TODO: Инициализация со счетчиком отказов и списком транзакций
        pass

    @property
    def device_id(self) -> str:
        pass

    @property
    def transactions(self) -> list[PaymentReceipt]:
        pass

    @property
    def failed_attempts_count(self) -> int:
        pass

    @property
    def total_revenue(self) -> Decimal:
        # TODO: Сумма amount всех успешных транзакций
        pass

    def validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt:
        # TODO: Полиморфная обработка с инкрементом failed_attempts_count при отказе
        pass
`,
  testCode: `from decimal import Decimal

# --- Тест 1: Оплата наличными CashPayment ---
cash_ok = CashPayment(Decimal("200.00"))
res_cash = cash_ok.process_payment(Decimal("100.00"))
assert res_cash.is_success is True
assert res_cash.amount == Decimal("100.00")
assert res_cash.payment_method == "CASH"
assert "100" in res_cash.error_message, "В чеке наличных должна быть зафиксирована сдача"

# Нехватка наличных (пассажир дал 50 KZT при тарифе 100 KZT)
cash_short = CashPayment(Decimal("50.00"))
res_short = cash_short.process_payment(Decimal("100.00"))
assert res_short.is_success is False
assert "недостаточно" in res_short.error_message.lower()
print("[OK] Test 1: CashPayment корректно вычисляет сдачу и фиксирует нехватку купюр")

# --- Тест 2: Мок сбоя MockFailingPayment ---
mock_fail = MockFailingPayment("Ошибка криптографического чипа карты")
res_mock = mock_fail.process_payment(Decimal("100.00"))
assert res_mock.is_success is False
assert res_mock.amount == Decimal("0.00")
assert "криптографического" in res_mock.error_message
print("[OK] Test 2: MockFailingPayment корректно эмулирует аппаратные и сетевые сбои")

# --- Тест 3: Работа AuditedValidatorDevice ---
validator = AuditedValidatorDevice("VAL-AUDIT-99")
assert validator.failed_attempts_count == 0
assert validator.total_revenue == Decimal("0.00")

# 1-й платеж: успешная оплата наличными 100 KZT
validator.validate_ride(cash_ok, Decimal("100.00"))
assert validator.failed_attempts_count == 0
assert validator.total_revenue == Decimal("100.00")
assert len(validator.transactions) == 1

# 2-й платеж: сбой через MockFailingPayment
validator.validate_ride(mock_fail, Decimal("100.00"))
assert validator.failed_attempts_count == 1
assert validator.total_revenue == Decimal("100.00"), "Выручка не должна расти при сбое"
assert len(validator.transactions) == 1

# 3-й платеж: сбой из-за нехватки наличных
validator.validate_ride(cash_short, Decimal("100.00"))
assert validator.failed_attempts_count == 2
assert validator.total_revenue == Decimal("100.00")

# 4-й платеж: еще одна успешная оплата 150 KZT
cash_express = CashPayment(Decimal("500.00"))
validator.validate_ride(cash_express, Decimal("150.00"))
assert validator.failed_attempts_count == 2
assert validator.total_revenue == Decimal("250.00")
assert len(validator.transactions) == 2
print("[OK] Test 3: AuditedValidatorDevice безошибочно ведет аудит отказов и суммирует выручку")

print("[OK] Все тесты домашнего задания Недели 3 успешно пройдены! (+10 баллов)")
`,
  hints: [
    'В CashPayment.process_payment: сдача change = self._cash_tendered - amount. Запишите ее в error_message чека как "Сдача: {change}".',
    'В AuditedValidatorDevice.total_revenue: sum((t.amount for t in self._transactions), Decimal("0.00")).',
    'В validate_ride: если not receipt.is_success -> self._failed_attempts += 1.',
  ],
};
