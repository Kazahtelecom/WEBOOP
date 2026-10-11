import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { finalExam } from '../src/data/exam';

describe('Final Exam Module Structure and Verification', () => {
  it('should have valid exam metadata and exactly 25 points allocated', () => {
    expect(finalExam.id).toBe('final-exam');
    expect(finalExam.examScore).toBe(25);
    expect(finalExam.title).toContain('25 баллов');
    expect(finalExam.buggyCode.length).toBeGreaterThan(100);
    expect(finalExam.testCode.length).toBeGreaterThan(100);
  });

  it('should fail with buggy starter code', () => {
    const fullCode = `${finalExam.buggyCode}\n\n${finalExam.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    // Стартовый код с багами должен падать
    expect(result.status).not.toBe(0);
  });

  const fixedSolution = `
from decimal import Decimal, ROUND_HALF_UP

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
        
        # Исправление Бага 1: Проверка ДО изменения _current_passengers
        if self._current_passengers + count > self._capacity:
            raise CapacityExceededError("Превышена вместимость автобуса")
        self._current_passengers += count

    def leave_passengers(self, count: int) -> None:
        if count <= 0:
            raise ValueError("Количество должно быть > 0")
        if count > self._current_passengers:
            raise ValueError("Нельзя высадить больше пассажиров, чем в салоне")
        self._current_passengers -= count

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
        # Исправление Бага 2: Применение политики скидок
        zoned = self._base_fare * self._zone_policy.multiplier
        final = self._discount_policy.apply(zoned)
        return final.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

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
        # Исправление Бага 3: Полиморфный вызов process_payment без isinstance
        if not hasattr(payment_method, "process_payment"):
            raise TypeError("payment_method должен иметь метод process_payment")

        fare = self._fare_calculator.calculate_fare()
        receipt = payment_method.process_payment(fare)
        if receipt.is_success:
            self._transactions.append(receipt)
        return receipt
`;

  it('should pass all verification tests with fixed solution', () => {
    const fullCode = `${fixedSolution}\n\n${finalExam.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('ВСЕ 3 БАГА УСПЕШНО ИСПРАВЛЕНЫ! ФИНАЛЬНЫЙ ЭКЗАМЕН СДАН! (+25 баллов)');
  });
});
