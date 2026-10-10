import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { weboopCourse, getCourseItemById } from '../src/data/courseData';
import { week1Lecture, week1PracticeTask, week1HomeworkTask } from '../src/data/week1';

describe('Week 1 Curriculum and Tasks Structure', () => {
  it('should have complete and valid course metadata', () => {
    expect(weboopCourse.id).toBe('course-weboop-avtobys');
    expect(weboopCourse.totalMaxScore).toBe(100);
    expect(weboopCourse.weeks.length).toBe(3);
    expect(weboopCourse.finalExam).toBeDefined();
    expect(weboopCourse.finalExam?.examScore).toBe(25);
  });

  it('should have exactly 25 points allocated for Week 1', () => {
    const week1 = weboopCourse.weeks[0];
    expect(week1.weekNumber).toBe(1);
    expect(week1.maxScore).toBe(25);

    const practicePoints = week1.practiceTasks.reduce((sum, t) => sum + t.scorePoints, 0);
    const homeworkPoints = week1.homeworkTask.scorePoints;

    expect(practicePoints).toBe(15);
    expect(homeworkPoints).toBe(10);
    expect(practicePoints + homeworkPoints).toBe(25);
  });

  it('should have 4 interactive quick-checks in Week 1 lecture', () => {
    expect(week1Lecture.id).toBe('week-1-lecture');
    expect(week1Lecture.durationMinutes).toBe(45);
    expect(week1Lecture.quickChecks.length).toBe(4);

    for (const qc of week1Lecture.quickChecks) {
      expect(qc.id).toBeTruthy();
      expect(qc.question).toBeTruthy();
      expect(qc.options.length).toBeGreaterThanOrEqual(3);
      expect(qc.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(qc.correctOptionIndex).toBeLessThan(qc.options.length);
      expect(qc.explanation).toBeTruthy();
    }
  });

  it('should resolve course items by id correctly', () => {
    const lectureItem = getCourseItemById('week-1-lecture');
    expect(lectureItem).not.toBeNull();
    expect(lectureItem?.type).toBe('lesson');

    const practiceItem = getCourseItemById('week-1-practice-transit-card');
    expect(practiceItem).not.toBeNull();
    expect(practiceItem?.type).toBe('task');

    const hwItem = getCourseItemById('week-1-homework-passenger');
    expect(hwItem).not.toBeNull();
    expect(hwItem?.type).toBe('task');

    const nonexistent = getCourseItemById('nonexistent-id');
    expect(nonexistent).toBeNull();
  });
});

describe('Week 1 Tasks Solution Verification (Python Runtime)', () => {
  const task1Solution = `
from decimal import Decimal

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
`;

  it('should pass all tests with reference solution for TransitCard (Task 1)', () => {
    const fullCode = `${task1Solution}\n\n${week1PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты пройдены! (+15 баллов)');
  });

  it('should reject buggy solution that fails to prevent negative balance', () => {
    // Решение с багом: не проверяет нехватку средств
    const buggyCode = task1Solution.replace(
      'if self._balance < effective:\n            raise InsufficientFundsError("Недостаточно средств")',
      'pass'
    );
    const fullCode = `${buggyCode}\n\n${week1PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).not.toBe(0);
  });

  const task2Solution = `
${task1Solution}

class Passenger:
    def __init__(self, passenger_id: str, full_name: str, card: TransitCard | None = None):
        if not passenger_id or not passenger_id.strip():
            raise ValueError("ID пассажира не может быть пустым")
        if not full_name or not full_name.strip():
            raise ValueError("Имя пассажира не может быть пустым")
        self._passenger_id = passenger_id.strip()
        self._full_name = full_name.strip()
        self._card = None
        if card is not None:
            self.link_card(card)

    @property
    def passenger_id(self) -> str:
        return self._passenger_id

    @property
    def full_name(self) -> str:
        return self._full_name

    @property
    def card(self) -> TransitCard | None:
        return self._card

    def link_card(self, card: TransitCard) -> None:
        if not isinstance(card, TransitCard):
            raise TypeError("card должен быть экземпляром TransitCard")
        if card.is_blocked:
            raise CardBlockedError("Невозможно привязать заблокированную карту")
        self._card = card

    def unlink_card(self) -> None:
        self._card = None

    def pay_trip(self, base_fare: Decimal) -> Decimal:
        if self._card is None:
            raise ValueError("У пассажира нет привязанной карты")
        return self._card.charge_fare(base_fare)
`;

  it('should pass all tests with reference solution for Passenger (Task 2)', () => {
    const fullCode = `${task2Solution}\n\n${week1HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты пройдены! (+10 баллов)');
  });

  it('should reject buggy solution that allows linking blocked card', () => {
    const buggyCode = task2Solution.replace(
      'if card.is_blocked:\n            raise CardBlockedError("Невозможно привязать заблокированную карту")',
      'pass'
    );
    const fullCode = `${buggyCode}\n\n${week1HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).not.toBe(0);
  });
});
