import type { ExamModule } from '../types/course';

export const finalExam: ExamModule = {
  id: 'final-exam',
  title: 'Финальный экзамен: Практический багфикс-квест (25 баллов)',
  descriptionMarkdown: `## Финальный экзамен: Интеграционный багфикс-квест Avtobys

Поздравляем с выходом на финишную прямую! Вы набрали необходимые 75+ баллов за практические недели и допущены к итоговому испытанию.

Вам передана кодовая база транспортной подсистемы **Avtobys**, объединяющая модули всех трех недель:
- **Неделя 1:** Класс \`Bus\` с инвариантом вместимости салона.
- **Неделя 2:** Калькулятор тарифов \`FareCalculator\` с композицией политик скидок и зон.
- **Неделя 3:** Полиморфный терминал \`ValidatorDevice\`, принимающий любые реализации \`PaymentMethod\`.

### 🚨 Ситуация:
Предыдущий разработчик в спешке допустил в связке **3 критические архитектурные ошибки**, из-за которых интеграционные тесты транспортной сети падают.

### 🎯 Ваша задача:
Найти и устранить все 3 ошибки в коде редактора справа, добившись успешного прохождения проверочных тестов:

1. **Баг №1 (Нарушение инкапсуляции и атомарности состояния):**
   - В методе \`Bus.board_passengers\` при попытке переполнения салона выбрасывается \`CapacityExceededError\`, однако внутреннее состояние \`_current_passengers\` успевает испортиться и сохраняет некорректное число людей.
   - *Требование:* Если посадка невозможна, число пассажиров в салоне не должно измениться ни на одного человека!

2. **Баг №2 (Сломанная композиция стратегий тарифа):**
   - В \`FareCalculator.calculate_fare\` калькулятор игнорирует переданную ему политику скидки (\`discount_policy\`) и рассчитывает полную стоимость, из-за чего студенческие и пенсионные льготы не применяются.
   - *Требование:* Обеспечить корректное делегирование расчета политике скидки: \`self._discount_policy.apply(zoned_fare)\`.

3. **Баг №3 (Нарушение полиморфизма и принципа Liskov Substitution):**
   - В \`ValidatorDevice.validate_ride\` установлена жесткая проверка \`isinstance(payment, CardPayment)\`, блокирующая прием оплаты по QR-коду и нарушающая принцип утиной типизации.
   - *Требование:* Устранить искусственное ограничение типов. Терминал должен полиморфно принимать любой объект с методом \`process_payment(fare)\`.
`,
  buggyCode: `from decimal import Decimal, ROUND_HALF_UP

# ==========================================
# 1. МОДУЛЬ НЕДЕЛИ 1: Инкапсуляция и инварианты
# ==========================================

class CapacityExceededError(Exception):
    pass

class Bus:
    def __init__(self, plate_number: str, capacity: int):
        if not plate_number or not plate_number.strip():
            raise ValueError("Госномер не может быть пустым")
        if not (10 <= capacity <= 250):
            raise ValueError("Вместимость должна быть от 10 до 250")
        self._plate_number = plate_number.strip()
        self._capacity = capacity
        self._current_passengers = 0

    @property
    def plate_number(self) -> str:
        return self._plate_number

    @property
    def capacity(self) -> int:
        return self._capacity

    @property
    def current_passengers(self) -> int:
        return self._current_passengers

    def board_passengers(self, count: int) -> None:
        if count <= 0:
            raise ValueError("Количество должно быть > 0")
        
        # ⚠️ БАГ 1: Подозрительный порядок операций!
        # Что произойдет с _current_passengers, если условие не выполнится?
        self._current_passengers += count
        if self._current_passengers > self._capacity:
            raise CapacityExceededError("Превышена вместимость автобуса")

    def leave_passengers(self, count: int) -> None:
        if count <= 0:
            raise ValueError("Количество должно быть > 0")
        if count > self._current_passengers:
            raise ValueError("Нельзя высадить больше пассажиров, чем в салоне")
        self._current_passengers -= count


# ==========================================
# 2. МОДУЛЬ НЕДЕЛИ 2: Композиция политик тарифа
# ==========================================

class DiscountPolicy:
    def apply(self, amount: Decimal) -> Decimal:
        raise NotImplementedError

class StandardDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        return amount

class StudentDiscount(DiscountPolicy):
    def apply(self, amount: Decimal) -> Decimal:
        return amount * Decimal("0.50")

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

class FareCalculator:
    def __init__(
        self,
        base_fare: Decimal,
        discount_policy: DiscountPolicy,
        zone_policy: ZoneMultiplierPolicy
    ):
        self._base_fare = base_fare
        self._discount_policy = discount_policy
        self._zone_policy = zone_policy

    @property
    def base_fare(self) -> Decimal:
        return self._base_fare

    @property
    def discount_policy(self) -> DiscountPolicy:
        return self._discount_policy

    @property
    def zone_policy(self) -> ZoneMultiplierPolicy:
        return self._zone_policy

    def calculate_fare(self) -> Decimal:
        # ⚠️ БАГ 2: Почему скидка не применяется к зонному тарифу?
        zoned = self._base_fare * self._zone_policy.multiplier
        # Ошибка: разработчик забыл вызвать self._discount_policy.apply(...)!
        return zoned.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


# ==========================================
# 3. МОДУЛЬ НЕДЕЛИ 3: Полиморфизм платежей
# ==========================================

class PaymentReceipt:
    def __init__(self, receipt_id: str, amount: Decimal, payment_method: str, is_success: bool):
        self.receipt_id = receipt_id
        self.amount = amount
        self.payment_method = payment_method
        self.is_success = is_success

class CardPayment:
    def __init__(self, card_id: str, balance: Decimal):
        self._card_id = card_id
        self._balance = balance

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        if self._balance >= amount:
            self._balance -= amount
            return PaymentReceipt(f"RCP-{self._card_id}", amount, "CARD", True)
        return PaymentReceipt(f"RCP-{self._card_id}", Decimal("0.00"), "CARD", False)

class QRPayment:
    def __init__(self, qr_token: str, balance: Decimal):
        self._qr_token = qr_token
        self._balance = balance

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        if self._balance >= amount:
            self._balance -= amount
            return PaymentReceipt(f"RCP-{self._qr_token}", amount, "QR", True)
        return PaymentReceipt(f"RCP-{self._qr_token}", Decimal("0.00"), "QR", False)

class ValidatorDevice:
    def __init__(self, device_id: str, fare_calculator: FareCalculator):
        self._device_id = device_id
        self._fare_calculator = fare_calculator
        self._transactions = []

    def validate_ride(self, payment_method) -> PaymentReceipt:
        # ⚠️ БАГ 3: Зачем здесь жесткая проверка конкретного класса CardPayment?
        # Разве QRPayment не может оплатить проезд полиморфно?
        if not isinstance(payment_method, CardPayment):
            raise TypeError("Терминал поддерживает только оплату транспортными картами")

        fare = self._fare_calculator.calculate_fare()
        receipt = payment_method.process_payment(fare)
        if receipt.is_success:
            self._transactions.append(receipt)
        return receipt
`,
  testCode: `from decimal import Decimal

# --- Верификация Бага 1: Атомарность состояния Bus при ошибке ---
bus = Bus("123 AB 02", 50)
bus.board_passengers(40)
assert bus.current_passengers == 40

try:
    # Попытка посадить 15 человек (40 + 15 = 55 > 50)
    bus.board_passengers(15)
    assert False, "Превышение вместимости должно вызывать CapacityExceededError"
except CapacityExceededError:
    pass

# КРИТИЧЕСКАЯ ПРОВЕРКА БАГА 1:
assert bus.current_passengers == 40, (
    f"БАГ 1 НЕ ИСПРАВЛЕН: При сбое посадки салон испортился! "
    f"Ожидалось ровно 40 пассажиров, в салоне оказалось: {bus.current_passengers}"
)
print("[OK] Баг 1 успешно устранен: Инвариант вместимости Bus защищен атомарно")

# --- Верификация Бага 2: Применение скидки в FareCalculator ---
std_disc = StandardDiscount()
stu_disc = StudentDiscount()
urban = UrbanZonePolicy()
suburban = SuburbanZonePolicy()

base = Decimal("100.00")
calc_student_suburban = FareCalculator(base, stu_disc, suburban)
fare = calc_student_suburban.calculate_fare()

# 100 * 1.30 (пригород) = 130.00 KZT; Скидка 50% = 65.00 KZT
assert fare == Decimal("65.00"), (
    f"БАГ 2 НЕ ИСПРАВЛЕН: Скидка не применилась к тарифу! "
    f"Ожидалось 65.00 KZT, получено: {fare}"
)
print("[OK] Баг 2 успешно устранен: FareCalculator корректно делегирует расчет скидки")

# --- Верификация Бага 3: Полиморфизм в ValidatorDevice ---
calc_regular = FareCalculator(base, std_disc, urban)
validator = ValidatorDevice("VAL-TEST-01", calc_regular)

# Оплата картой
card = CardPayment("KZ-111", Decimal("200.00"))
rcp_card = validator.validate_ride(card)
assert rcp_card.is_success is True
assert rcp_card.amount == Decimal("100.00")

# Оплата QR-кодом (раньше падала с TypeError из-за isinstance)
qr = QRPayment("QR-SECRET-999", Decimal("500.00"))
try:
    rcp_qr = validator.validate_ride(qr)
except TypeError as te:
    assert False, f"БАГ 3 НЕ ИСПРАВЛЕН: Валидатор отклонил QRPayment по типу: {te}"

assert rcp_qr.is_success is True
assert rcp_qr.payment_method == "QR"
assert rcp_qr.amount == Decimal("100.00")
print("[OK] Баг 3 успешно устранен: ValidatorDevice полиморфно обслуживает и карты, и QR")

print("[OK] ВСЕ 3 БАГА УСПЕШНО ИСПРАВЛЕНЫ! ФИНАЛЬНЫЙ ЭКЗАМЕН СДАН! (+25 баллов)")
`,
  examScore: 25,
};
