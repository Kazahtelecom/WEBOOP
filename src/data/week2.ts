import type { Lesson, CodeTask } from '../types/course';

export const week2Lecture: Lesson = {
  id: 'week-2-lecture',
  title: 'Лекция: Наследование и композиция («Composition over Inheritance») в Avtobys',
  durationMinutes: 45,
  contentMarkdown: `# Неделя 2: Наследование и композиция («Composition over Inheritance»)

Добро пожаловать во второй модуль курса! На этой неделе мы разберем одну из главных ловушек объектно-ориентированного проектирования — злоупотребление наследованием — и изучим фундаментальный архитектурный принцип: **«Композиция вместо наследования»** (*Composition over Inheritance*).

---

### 1. Возможности и границы наследования («is-a»)

Наследование связывает классы отношением **«является» (is-a)**:
\`\`\`python
class Vehicle:
    def __init__(self, vin: str):
        self.vin = vin

class Bus(Vehicle):  # Автобус ЯВЛЯЕТСЯ Транспортным средством
    def __init__(self, vin: str, capacity: int):
        super().__init__(vin)
        self.capacity = capacity
\`\`\`

Наследование отлично работает, когда доменная сущность *концептуально и неизменно* является специализированной версией родителя (например, \`Dog is-a Animal\`).

Однако проблемы начинаются, когда наследование пытаются использовать для **моделирования изменяемого поведения** или **комбинаторных бизнес-правил**.

---

### 2. Проблема комбинаторного взрыва подклассов

Представим систему расчета тарифов в транспорте **Avtobys**:
1. Есть 3 категории пассажиров: **Обычный**, **Студент (скидка 50%)**, **Пенсионер (бесплатно)**.
2. Есть 3 зоны поездки: **Городская (1.0)**, **Пригородная (1.3)**, **Экспресс (1.5)**.
3. Есть 3 временных интервала: **Стандарт**, **Час пик (+20%)**, **Ночной (-20%)**.

Если решать эту задачу через наследование:
- \`StandardUrbanBus\`
- \`StudentUrbanBus\`
- \`SeniorUrbanBus\`
- \`StudentSuburbanPeakBus\`
- \`SeniorExpressNightBus\`
- ...

При $3 \\times 3 \\times 3$ вариантах нам потребуется создать **27 отдельных классов**! А добавление еще одного фактора (например, оплата в праздничный день) удвоит число классов до **54**! Это архитектурный антипаттерн — **Комбинаторный взрыв подклассов (Combinatorial Class Explosion)**.

---

### 3. Композиция как гибкая альтернатива («has-a»)

Принцип **Composition over Inheritance** («has-a» — *содержит в себе*) предлагает разделить монолитный класс на независимые компоненты с единой ответственностью (*Single Responsibility Principle*):

> **Вместо жесткой иерархии классов мы создаем легковесный контекст-калькулятор, в который «вкладываются» (внедряются) независимые объекты-политики.**

\`\`\`python
# Контекст КОМПОНИРУЕТ политики (has-a)
class FareCalculator:
    def __init__(self, base_fare: Decimal, discount_policy, zone_policy):
        self._base_fare = base_fare
        self._discount = discount_policy  # has-a DiscountPolicy
        self._zone = zone_policy          # has-a ZoneMultiplierPolicy

    def calculate_fare(self) -> Decimal:
        zone_price = self._base_fare * self._zone.multiplier
        return self._discount.apply(zone_price)
\`\`\`

Теперь вместо $3 \\times 3 = 9$ комбинаций подклассов у нас есть всего:
- 1 класс калькулятора (\`FareCalculator\`)
- 3 политики скидок
- 3 политики зон
Всего **7 классов**, покрывающих любые сценарии!

---

### 4. Паттерн «Стратегия» (Strategy Pattern)

Архитектурная композиция изменяемого поведения в ООП называется паттерном **Стратегия (Strategy)**:
1. Выделяется семейство взаимозаменяемых алгоритмов (например, \`DiscountPolicy\`).
2. Каждый алгоритм инкапсулируется в отдельный класс (\`StandardDiscount\`, \`StudentDiscount\`, \`SeniorDiscount\`).
3. Классы алгоритмов имеют единообразный публичный интерфейс (\`apply(amount: Decimal) -> Decimal\`).
4. Клиентский контекст (\`FareCalculator\`) работает с ними абстрактно, не зная деталей реализации.

---

### 5. Динамическая смена политик на лету (Runtime Swapping)

Главная сила композиции — объект может менять свое поведение **прямо во время выполнения программы**, чего невозможно добиться жестким наследованием:

\`\`\`python
calc = FareCalculator(base_fare=Decimal("100.00"), discount=StandardDiscount())
print(calc.calculate_fare())  # 100.00 KZT

# Пассажир предъявил студенческий билет:
calc.set_discount(StudentDiscount())
print(calc.calculate_fare())  # 50.00 KZT!
\`\`\`

---

### 6. Сравнение подходов

| Критерий | Наследование (is-a) | Композиция (has-a) |
|---|---|---|
| **Связанность (Coupling)** | Высокая (White-box reuse) | Низкая (Black-box reuse) |
| **Изменение поведения** | Только во время компиляции | Динамически в Runtime |
| **Масштабируемость** | Экспоненциальный рост классов | Линейный рост классов |
| **Тестируемость** | Сложно тестировать изолированно | Легко тестировать каждую политику отдельно |
`,
  quickChecks: [
    {
      id: 'w2-qc-1',
      question: 'В чем заключается проблема комбинаторного взрыва подклассов при наследовании?',
      options: [
        'Интерпретатор Python аварийно завершает работу при создании более 10 классов',
        'Количество классов растет экспоненциально при добавлении новых независимых осей вариации поведения',
        'Наследование запрещено стандартом PEP 8',
        'В Python невозможно объявить более одного уровня наследования',
      ],
      correctOptionIndex: 1,
      explanation:
        'При добавлении новых ортогональных параметров (скидки, зоны, время) число классов-наследников перемножается (3 * 3 * 3 = 27), что делает кодовую базу неуправляемой.',
    },
    {
      id: 'w2-qc-2',
      question: 'Какое отношение между сущностями выражает композиция?',
      options: [
        '«Является» (is-a)',
        '«Содержит в себе / использует» (has-a)',
        '«Наследует от» (inherits-from)',
        '«Импортирует из» (imports-from)',
      ],
      correctOptionIndex: 1,
      explanation:
        'Композиция выражает отношение «has-a»: калькулятор содержит ссылку на политику скидок и делегирует ей вычисление.',
    },
    {
      id: 'w2-qc-3',
      question: 'Какое ключевое преимущество дает композиция по сравнению со статическим наследованием?',
      options: [
        'Возможность изменять поведение объекта динамически во время выполнения программы (в Runtime)',
        'Уменьшение размера файла исходного кода в байтах',
        'Автоматическое шифрование переменных класса',
        'Отказ от использования конструктора __init__',
      ],
      correctOptionIndex: 0,
      explanation:
        'В отличие от жестко заданного наследования, объект с композицией может в любой момент заменить одну стратегию на другую с помощью сеттера.',
    },
    {
      id: 'w2-qc-4',
      question: 'Какому паттерну проектирования GoF соответствует выделение независимых политик расчета тарифов?',
      options: [
        'Одиночка (Singleton)',
        'Стратегия (Strategy)',
        'Адаптер (Adapter)',
        'Наблюдатель (Observer)',
      ],
      correctOptionIndex: 1,
      explanation:
        'Паттерн «Стратегия» инкапсулирует семейство взаимозаменяемых алгоритмов и позволяет контексту использовать их единообразно.',
    },
  ],
};

export const week2PracticeTask: CodeTask = {
  id: 'week-2-practice-fare-calculator',
  title: 'Практика: FareCalculator и композиция политик скидок и зон',
  scorePoints: 15,
  descriptionMarkdown: `## Практическое задание: Калькулятор тарифов на основе композиции

Вам предстоит спроектировать модуль тарификации **Avtobys**, преодолев проблему комбинаторного взрыва подклассов с помощью композиции.

---

### 1. Семейство политик скидок (\`DiscountPolicy\`):
Базовый класс:
\`\`\`python
class DiscountPolicy:
    def apply(self, amount: Decimal) -> Decimal:
        raise NotImplementedError
\`\`\`

Реализуйте конкретные классы-стратегии:
- \`StandardDiscount\`: базовая ставка, скидки нет (возвращает исходную сумму \`amount\`).
- \`StudentDiscount\`: студенческая льгота 50% (возвращает \`amount * Decimal("0.50")\`).
- \`SeniorDiscount\`: пенсионная льгота 100% (возвращает \`Decimal("0.00")\`).

Все возвращаемые значения должны быть экземплярами \`Decimal\`. Если входной \`amount <= Decimal("0.00")\` — выбросить \`ValueError\`.

---

### 2. Семейство политик зональных коэффициентов (\`ZoneMultiplierPolicy\`):
Базовый класс:
\`\`\`python
class ZoneMultiplierPolicy:
    @property
    def multiplier(self) -> Decimal:
        raise NotImplementedError
\`\`\`

Реализуйте конкретные классы:
- \`UrbanZonePolicy\`: городская черта (коэффициент \`Decimal("1.00")\`).
- \`SuburbanZonePolicy\`: пригородные маршруты (коэффициент \`Decimal("1.30")\`).
- \`ExpressZonePolicy\`: экспресс-маршруты (коэффициент \`Decimal("1.50")\`).

---

### 3. Контекст калькулятора (\`FareCalculator\`):
- **Конструктор:** \`__init__(self, base_fare: Decimal, discount_policy: DiscountPolicy, zone_policy: ZoneMultiplierPolicy)\`
  - \`base_fare\`: строго положительное число \`Decimal > Decimal("0.00")\` (иначе \`ValueError\`).
  - \`discount_policy\`: должен быть экземпляром \`DiscountPolicy\` (иначе \`TypeError\`).
  - \`zone_policy\`: должен быть экземпляром \`ZoneMultiplierPolicy\` (иначе \`TypeError\`).
- **Свойства (Read-Only):**
  - \`@property base_fare -> Decimal\`
  - \`@property discount_policy -> DiscountPolicy\`
  - \`@property zone_policy -> ZoneMultiplierPolicy\`
- **Метод расчета:** \`calculate_fare(self) -> Decimal\`:
  - 1. Вычисляется зонный тариф: \`zoned_fare = self._base_fare * self._zone_policy.multiplier\`
  - 2. К полученному результату применяется скидка: \`final_fare = self._discount_policy.apply(zoned_fare)\`
  - 3. Результат округляется до 2 знаков после запятой (\`quantize(Decimal("0.01"))\`) и возвращается.
`,
  starterCode: `from decimal import Decimal, ROUND_HALF_UP

# 1. Политики скидок
class DiscountPolicy:
    def apply(self, amount: Decimal) -> Decimal:
        raise NotImplementedError

class StandardDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        # TODO: Реализуйте проверку amount > 0 и возврат без скидки
        pass

class StudentDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        # TODO: Скидка 50%
        pass

class SeniorDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        # TODO: Бесплатный проезд (0.00)
        pass

# 2. Зональные политики
class ZoneMultiplierPolicy:
    @property
    def multiplier(self) -> Decimal:
        raise NotImplementedError

class UrbanZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.00")

class SuburbanZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.30")

class ExpressZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.50")

# 3. Контекст калькулятора (Композиция)
class FareCalculator:
    def __init__(
        self,
        base_fare: Decimal,
        discount_policy: DiscountPolicy,
        zone_policy: ZoneMultiplierPolicy
    ):
        # TODO: Проверьте инварианты и типы, сохраните в приватные поля
        pass

    @property
    def base_fare(self) -> Decimal:
        pass

    @property
    def discount_policy(self) -> DiscountPolicy:
        pass

    @property
    def zone_policy(self) -> ZoneMultiplierPolicy:
        pass

    def calculate_fare(self) -> Decimal:
        # TODO: Вычислите тариф с учетом зоны и скидки с округлением до 0.01
        pass
`,
  testCode: `from decimal import Decimal, ROUND_HALF_UP

# --- Тест 1: Проверка политик скидок ---
std = StandardDiscount()
stu = StudentDiscount()
sen = SeniorDiscount()

assert std.apply(Decimal("100.00")) == Decimal("100.00")
assert stu.apply(Decimal("100.00")) == Decimal("50.00")
assert sen.apply(Decimal("100.00")) == Decimal("0.00")

try:
    std.apply(Decimal("-10.00"))
    assert False, "Отрицательная сумма должна вызывать ValueError"
except ValueError:
    pass
print("[OK] Test 1: Политики скидок корректно вычисляют льготы")

# --- Тест 2: Проверка зональных политик ---
urban = UrbanZonePolicy()
suburban = SuburbanZonePolicy()
express = ExpressZonePolicy()

assert urban.multiplier == Decimal("1.00")
assert suburban.multiplier == Decimal("1.30")
assert express.multiplier == Decimal("1.50")
print("[OK] Test 2: Зональные коэффициенты соответствуют спецификации")

# --- Тест 3: Валидация типов и инвариантов FareCalculator ---
try:
    FareCalculator(Decimal("0.00"), std, urban)
    assert False, "base_fare <= 0 должен вызывать ValueError"
except ValueError:
    pass

try:
    FareCalculator(Decimal("100.00"), "не политика", urban) # type: ignore
    assert False, "Неверный тип discount_policy должен вызывать TypeError"
except TypeError:
    pass

try:
    FareCalculator(Decimal("100.00"), std, "не зона") # type: ignore
    assert False, "Неверный тип zone_policy должен вызывать TypeError"
except TypeError:
    pass
print("[OK] Test 3: Валидация параметров конструктора FareCalculator")

# --- Тест 4: Расчет тарифов при различных комбинациях ---
base = Decimal("100.00")

# Город + Обычный = 100.00 KZT
calc1 = FareCalculator(base, std, urban)
assert calc1.calculate_fare() == Decimal("100.00")

# Город + Студент = 50.00 KZT
calc2 = FareCalculator(base, stu, urban)
assert calc2.calculate_fare() == Decimal("50.00")

# Пригород + Студент: 100 * 1.30 = 130; 130 * 0.5 = 65.00 KZT
calc3 = FareCalculator(base, stu, suburban)
assert calc3.calculate_fare() == Decimal("65.00")

# Экспресс + Обычный: 100 * 1.50 = 150.00 KZT
calc4 = FareCalculator(base, std, express)
assert calc4.calculate_fare() == Decimal("150.00")

# Экспресс + Пенсионер = 0.00 KZT
calc5 = FareCalculator(base, sen, express)
assert calc5.calculate_fare() == Decimal("0.00")
print("[OK] Test 4: Корректный композиционный расчет тарифов для всех комбинаций")

print("[OK] Все тесты первой практической задачи Недели 2 успешно пройдены! (+15 баллов)")
`,
  hints: [
    'В DiscountPolicy: проверьте if amount <= Decimal("0.00"): raise ValueError("Сумма должна быть > 0").',
    'В FareCalculator: проверьте isinstance(discount_policy, DiscountPolicy) и isinstance(zone_policy, ZoneMultiplierPolicy).',
    'В методе calculate_fare: zoned = self._base_fare * self._zone_policy.multiplier, затем return self._discount_policy.apply(zoned).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).',
  ],
};

export const week2HomeworkTask: CodeTask = {
  id: 'week-2-homework-peak-hour',
  title: 'Домашнее задание: Временные коэффициенты и динамическая смена политик',
  scorePoints: 10,
  descriptionMarkdown: `## Домашнее задание: Динамическая адаптация тарифов на лету

В реальной городской транспортной системе условия поездки меняются динамически: автобус въезжает в другую тарифную зону, наступает час пик, либо пассажир переключает тип льготы.

Вам предстоит расширить архитектуру калькулятора **Avtobys** временными политиками и методами динамической подмены стратегий.

---

### 1. Семейство временных политик (\`TimeMultiplierPolicy\`):
Базовый класс:
\`\`\`python
class TimeMultiplierPolicy:
    @property
    def multiplier(self) -> Decimal:
        raise NotImplementedError
\`\`\`

Реализуйте классы:
- \`StandardTimePolicy\`: обычные часы (коэффициент \`Decimal("1.00")\`).
- \`PeakHourPolicy\`: утренний и вечерний час пик (коэффициент \`Decimal("1.20")\`).
- \`NightTimePolicy\`: ночные рейсы (коэффициент \`Decimal("0.80")\`).

---

### 2. Расширенный калькулятор \`DynamicFareCalculator\`:
Класс наследуется от базового или расширяет калькулятор:
- **Конструктор:** \`__init__(self, base_fare: Decimal, discount_policy: DiscountPolicy, zone_policy: ZoneMultiplierPolicy, time_policy: TimeMultiplierPolicy | None = None)\`
  - Если \`time_policy is None\`, по умолчанию устанавливается экземпляр \`StandardTimePolicy()\`.
  - Валидация типов параметров (при несоответствии типа выбрасывать \`TypeError\`).
- **Свойства (Read-Only):**
  - \`@property time_policy -> TimeMultiplierPolicy\`
- **Сеттеры для динамической смены стратегий на лету (Runtime Swapping):**
  - \`set_discount_policy(self, policy: DiscountPolicy) -> None\` (проверка типа \`TypeError\`).
  - \`set_zone_policy(self, policy: ZoneMultiplierPolicy) -> None\` (проверка типа \`TypeError\`).
  - \`set_time_policy(self, policy: TimeMultiplierPolicy) -> None\` (проверка типа \`TypeError\`).
- **Метод расчета:** \`calculate_fare(self) -> Decimal\`:
  - Итоговая стоимость рассчитывается по формуле:
    \`gross_fare = self._base_fare * self._zone_policy.multiplier * self._time_policy.multiplier\`
    \`final_fare = self._discount_policy.apply(gross_fare)\`
  - Результат округляется до 2 знаков (\`quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)\`).
`,
  starterCode: `from decimal import Decimal, ROUND_HALF_UP

# Импортируйте базовые классы политик из первой части
class DiscountPolicy:
    def apply(self, amount: Decimal) -> Decimal:
        raise NotImplementedError

class StandardDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        if amount <= Decimal("0.00"):
            raise ValueError("Сумма должна быть > 0")
        return amount

class StudentDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        if amount <= Decimal("0.00"):
            raise ValueError("Сумма должна быть > 0")
        return amount * Decimal("0.50")

class SeniorDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        if amount <= Decimal("0.00"):
            raise ValueError("Сумма должна быть > 0")
        return Decimal("0.00")

class ZoneMultiplierPolicy:
    @property
    def multiplier(self) -> Decimal:
        raise NotImplementedError

class UrbanZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.00")

class SuburbanZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.30")

class ExpressZonePolicy(ZoneMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.50")

# 1. Семейство временных политик
class TimeMultiplierPolicy:
    @property
    def multiplier(self) -> Decimal:
        raise NotImplementedError

class StandardTimePolicy(TimeMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.00")

class PeakHourPolicy(TimeMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("1.20")

class NightTimePolicy(TimeMultiplierPolicy):
    @property
    def multiplier(self) -> Decimal:
        return Decimal("0.80")

# 2. Динамический калькулятор тарифов
class DynamicFareCalculator:
    def __init__(
        self,
        base_fare: Decimal,
        discount_policy: DiscountPolicy,
        zone_policy: ZoneMultiplierPolicy,
        time_policy: TimeMultiplierPolicy | None = None
    ):
        # TODO: Реализуйте инициализацию с time_policy по умолчанию StandardTimePolicy()
        pass

    @property
    def base_fare(self) -> Decimal:
        pass

    @property
    def discount_policy(self) -> DiscountPolicy:
        pass

    @property
    def zone_policy(self) -> ZoneMultiplierPolicy:
        pass

    @property
    def time_policy(self) -> TimeMultiplierPolicy:
        pass

    def set_discount_policy(self, policy: DiscountPolicy) -> None:
        # TODO: Проверка типа и обновление стратегии
        pass

    def set_zone_policy(self, policy: ZoneMultiplierPolicy) -> None:
        pass

    def set_time_policy(self, policy: TimeMultiplierPolicy) -> None:
        pass

    def calculate_fare(self) -> Decimal:
        # TODO: gross = base * zone * time; return discount.apply(gross).quantize(0.01)
        pass
`,
  testCode: `from decimal import Decimal, ROUND_HALF_UP

# --- Тест 1: Проверка временных политик ---
std_time = StandardTimePolicy()
peak_time = PeakHourPolicy()
night_time = NightTimePolicy()

assert std_time.multiplier == Decimal("1.00")
assert peak_time.multiplier == Decimal("1.20")
assert night_time.multiplier == Decimal("0.80")
print("[OK] Test 1: Временные коэффициенты соответствуют спецификации")

# --- Тест 2: Инициализация с политикой времени по умолчанию ---
base = Decimal("100.00")
std_disc = StandardDiscount()
urban_zone = UrbanZonePolicy()

calc = DynamicFareCalculator(base, std_disc, urban_zone)
assert isinstance(calc.time_policy, StandardTimePolicy)
assert calc.calculate_fare() == Decimal("100.00")
print("[OK] Test 2: Корректная подстановка StandardTimePolicy по умолчанию")

# --- Тест 3: Расчет в час пик (PeakHourPolicy) ---
calc.set_time_policy(peak_time)
# 100 * 1.0 (город) * 1.2 (час пик) = 120.00 KZT
assert calc.calculate_fare() == Decimal("120.00")

# Добавляем студенческую скидку на лету (Runtime swapping):
stu_disc = StudentDiscount()
calc.set_discount_policy(stu_disc)
# 120 * 0.50 = 60.00 KZT
assert calc.calculate_fare() == Decimal("60.00")
print("[OK] Test 3: Расчет в час пик и динамическая смена скидки")

# --- Тест 4: Смена зоны на Экспресс (ExpressZonePolicy) ---
express_zone = ExpressZonePolicy()
calc.set_zone_policy(express_zone)
# 100 * 1.5 (экспресс) * 1.2 (час пик) = 180.00; скидка 50% = 90.00 KZT
assert calc.calculate_fare() == Decimal("90.00")
print("[OK] Test 4: Динамическая смена зоны поездки")

# --- Тест 5: Ночной тариф (NightTimePolicy) ---
calc.set_time_policy(night_time)
# 100 * 1.5 (экспресс) * 0.8 (ночь) = 120.00; скидка 50% = 60.00 KZT
assert calc.calculate_fare() == Decimal("60.00")
print("[OK] Test 5: Ночной тариф со скидкой")

# --- Тест 6: Валидация типов при смене политик (TypeError) ---
try:
    calc.set_discount_policy("не_скидка") # type: ignore
    assert False, "set_discount_policy должен требовать экземпляр DiscountPolicy"
except TypeError:
    pass

try:
    calc.set_zone_policy("не_зона") # type: ignore
    assert False, "set_zone_policy должен требовать экземпляр ZoneMultiplierPolicy"
except TypeError:
    pass

try:
    calc.set_time_policy("не_время") # type: ignore
    assert False, "set_time_policy должен требовать экземпляр TimeMultiplierPolicy"
except TypeError:
    pass
print("[OK] Test 6: Строгая проверка типов в сеттерах стратегий (TypeError)")

print("[OK] Все тесты домашнего задания Недели 2 успешно пройдены! (+10 баллов)")
`,
  hints: [
    'В DynamicFareCalculator.__init__: self._time_policy = time_policy if time_policy is not None else StandardTimePolicy().',
    'В сеттерах обязательно проверяйте isinstance(policy, ...) -> иначе raise TypeError.',
    'Итоговый расчет: gross = self._base_fare * self._zone_policy.multiplier * self._time_policy.multiplier; return self._discount_policy.apply(gross).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP).',
  ],
};
