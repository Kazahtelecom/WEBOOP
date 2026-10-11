import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { week3Lecture, week3PracticeTask, week3HomeworkTask } from '../src/data/week3';

describe('Week 3 Curriculum and Tasks Structure', () => {
  it('should have 4 interactive quick-checks in Week 3 lecture', () => {
    expect(week3Lecture.id).toBe('week-3-lecture');
    expect(week3Lecture.durationMinutes).toBe(45);
    expect(week3Lecture.quickChecks.length).toBe(4);

    for (const qc of week3Lecture.quickChecks) {
      expect(qc.id).toBeTruthy();
      expect(qc.question).toBeTruthy();
      expect(qc.options.length).toBeGreaterThanOrEqual(3);
      expect(qc.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(qc.correctOptionIndex).toBeLessThan(qc.options.length);
      expect(qc.explanation).toBeTruthy();
    }
  });

  it('should allocate exactly 15 points for practice and 10 points for homework', () => {
    expect(week3PracticeTask.scorePoints).toBe(15);
    expect(week3HomeworkTask.scorePoints).toBe(10);
    expect(week3PracticeTask.scorePoints + week3HomeworkTask.scorePoints).toBe(25);
  });
});

describe('Week 3 Python Runtime Verification', () => {
  const practiceSolution = `
from decimal import Decimal
from typing import Protocol

class PaymentReceipt:
    def __init__(
        self,
        receipt_id: str,
        amount: Decimal,
        payment_method: str,
        is_success: bool,
        error_message: str = ""
    ):
        if not receipt_id or not receipt_id.strip():
            raise ValueError("receipt_id не может быть пустым")
        if amount < Decimal("0.00"):
            raise ValueError("amount не может быть отрицательным")
        self._receipt_id = receipt_id.strip()
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

class PaymentMethod(Protocol):
    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        ...

class CardPayment:
    def __init__(self, card_id: str, balance: Decimal):
        if not card_id or not card_id.strip():
            raise ValueError("card_id не может быть пустым")
        if balance < Decimal("0.00"):
            raise ValueError("balance не может быть отрицательным")
        self._card_id = card_id.strip()
        self._balance = balance

    @property
    def balance(self) -> Decimal:
        return self._balance

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        if self._balance >= amount:
            self._balance -= amount
            return PaymentReceipt(
                receipt_id=f"RCP-CARD-{self._card_id}",
                amount=amount,
                payment_method="TRANSIT_CARD",
                is_success=True
            )
        return PaymentReceipt(
            receipt_id=f"RCP-CARD-{self._card_id}",
            amount=Decimal("0.00"),
            payment_method="TRANSIT_CARD",
            is_success=False,
            error_message="Недостаточно средств на балансе карты"
        )

class QRPayment:
    def __init__(self, qr_token: str, user_balance: Decimal, is_active: bool = True):
        if not qr_token or not qr_token.strip():
            raise ValueError("qr_token не может быть пустым")
        if user_balance < Decimal("0.00"):
            raise ValueError("user_balance не может быть отрицательным")
        self._qr_token = qr_token.strip()
        self._user_balance = user_balance
        self._is_active = is_active

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        if not self._is_active:
            return PaymentReceipt(
                receipt_id=f"RCP-QR-{self._qr_token}",
                amount=Decimal("0.00"),
                payment_method="QR",
                is_success=False,
                error_message="QR-код недействителен или уже использован"
            )
        if self._user_balance < amount:
            return PaymentReceipt(
                receipt_id=f"RCP-QR-{self._qr_token}",
                amount=Decimal("0.00"),
                payment_method="QR",
                is_success=False,
                error_message="Недостаточно средств на счете QR"
            )
        self._user_balance -= amount
        self._is_active = False
        return PaymentReceipt(
            receipt_id=f"RCP-QR-{self._qr_token}",
            amount=amount,
            payment_method="QR",
            is_success=True
        )

class ValidatorDevice:
    def __init__(self, device_id: str):
        if not device_id or not device_id.strip():
            raise ValueError("device_id не может быть пустым")
        self._device_id = device_id.strip()
        self._transactions = []

    @property
    def device_id(self) -> str:
        return self._device_id

    @property
    def transactions(self) -> list[PaymentReceipt]:
        return list(self._transactions)

    def validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt:
        if not hasattr(payment_method, "process_payment"):
            raise TypeError("Объект не реализует протокол PaymentMethod")
        receipt = payment_method.process_payment(fare)
        if receipt.is_success:
            self._transactions.append(receipt)
        return receipt
`;

  const homeworkSolution = `
${practiceSolution}

class CashPayment:
    def __init__(self, cash_tendered: Decimal):
        if cash_tendered <= Decimal("0.00"):
            raise ValueError("Внесенная сумма должна быть > 0")
        self._cash_tendered = cash_tendered

    @property
    def cash_tendered(self) -> Decimal:
        return self._cash_tendered

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        if self._cash_tendered < amount:
            return PaymentReceipt(
                receipt_id="RCP-CASH-FAIL",
                amount=Decimal("0.00"),
                payment_method="CASH",
                is_success=False,
                error_message="Внесенной суммы недостаточно для оплаты тарифа"
            )
        change = self._cash_tendered - amount
        return PaymentReceipt(
            receipt_id=f"RCP-CASH-{int(amount)}",
            amount=amount,
            payment_method="CASH",
            is_success=True,
            error_message=f"Сдача: {change}"
        )

class MockFailingPayment:
    def __init__(self, failure_reason: str = "Сетевой таймаут банковского шлюза"):
        self._failure_reason = failure_reason

    def process_payment(self, amount: Decimal) -> PaymentReceipt:
        return PaymentReceipt(
            receipt_id="RCP-MOCK-FAIL",
            amount=Decimal("0.00"),
            payment_method="MOCK_FAIL",
            is_success=False,
            error_message=self._failure_reason
        )

class AuditedValidatorDevice:
    def __init__(self, device_id: str):
        if not device_id or not device_id.strip():
            raise ValueError("device_id не может быть пустым")
        self._device_id = device_id.strip()
        self._transactions = []
        self._failed_attempts = 0

    @property
    def device_id(self) -> str:
        return self._device_id

    @property
    def transactions(self) -> list[PaymentReceipt]:
        return list(self._transactions)

    @property
    def failed_attempts_count(self) -> int:
        return self._failed_attempts

    @property
    def total_revenue(self) -> Decimal:
        return sum((t.amount for t in self._transactions), Decimal("0.00"))

    def validate_ride(self, payment_method, fare: Decimal) -> PaymentReceipt:
        if not hasattr(payment_method, "process_payment"):
            raise TypeError("Объект не реализует протокол PaymentMethod")
        receipt = payment_method.process_payment(fare)
        if receipt.is_success:
            self._transactions.append(receipt)
        else:
            self._failed_attempts += 1
        return receipt
`;

  it('should pass all tests for Week 3 practice task (PaymentMethod & ValidatorDevice)', () => {
    const fullCode = `${practiceSolution}\n\n${week3PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты первой практической задачи Недели 3 успешно пройдены!');
  });

  it('should pass all tests for Week 3 homework task (CashPayment, MockFailingPayment, AuditedValidatorDevice)', () => {
    const fullCode = `${homeworkSolution}\n\n${week3HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты домашнего задания Недели 3 успешно пройдены!');
  });

  it('should reject invalid practice solution that does not deactivate QR token', () => {
    const buggyCode = practiceSolution.replace('self._is_active = False', 'pass');
    const fullCode = `${buggyCode}\n\n${week3PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });

  it('should reject invalid homework solution that fails to increment failed attempts', () => {
    const buggyCode = homeworkSolution.replace('self._failed_attempts += 1', 'pass');
    const fullCode = `${buggyCode}\n\n${week3HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });
});
