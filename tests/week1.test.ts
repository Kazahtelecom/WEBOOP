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

    const practiceItem = getCourseItemById('week-1-practice-bus-route');
    expect(practiceItem).not.toBeNull();
    expect(practiceItem?.type).toBe('task');

    const hwItem = getCourseItemById('week-1-homework-card-ticket');
    expect(hwItem).not.toBeNull();
    expect(hwItem?.type).toBe('task');

    const examItem = getCourseItemById('final-exam');
    expect(examItem).not.toBeNull();
    expect(examItem?.type).toBe('task');

    const nonexistent = getCourseItemById('nonexistent-id');
    expect(nonexistent).toBeNull();
  });
});

describe('Week 1 Tasks Solution Verification (Python Runtime)', () => {
  const task1Solution = `
from decimal import Decimal

class CapacityExceededError(Exception):
    pass

class Route:
    def __init__(self, route_number: str, stops: list[str], base_fare: Decimal = Decimal("100.00")):
        if not route_number or not route_number.strip():
            raise ValueError("route_number не может быть пустым")
        if base_fare <= Decimal("0.00"):
            raise ValueError("base_fare должен быть > 0")
        if not stops or len(stops) < 2:
            raise ValueError("stops должен содержать минимум 2 остановки")
        for i in range(len(stops) - 1):
            if stops[i] == stops[i + 1]:
                raise ValueError("Остановки не должны дублироваться подряд")
        self._route_number = route_number.strip()
        self._stops = list(stops)
        self._base_fare = base_fare

    @property
    def route_number(self) -> str:
        return self._route_number

    @property
    def base_fare(self) -> Decimal:
        return self._base_fare

    @property
    def stops(self) -> list[str]:
        return list(self._stops)

class Bus:
    MIN_CAPACITY = 10
    MAX_CAPACITY = 250

    def __init__(self, plate_number: str, capacity: int):
        if not plate_number or not plate_number.strip():
            raise ValueError("plate_number не может быть пустым")
        if not (self.MIN_CAPACITY <= capacity <= self.MAX_CAPACITY):
            raise ValueError("Вместимость вне диапазона")
        self._plate_number = plate_number.strip()
        self._capacity = capacity
        self._current_passengers = 0
        self._route = None

    @property
    def plate_number(self) -> str:
        return self._plate_number

    @property
    def capacity(self) -> int:
        return self._capacity

    @property
    def current_passengers(self) -> int:
        return self._current_passengers

    @property
    def route(self):
        return self._route

    def assign_route(self, route: Route) -> None:
        if not isinstance(route, Route):
            raise TypeError("route должен быть экземпляром Route")
        self._route = route

    def board_passengers(self, count: int) -> None:
        if count <= 0:
            raise ValueError("count должен быть > 0")
        if self._current_passengers + count > self._capacity:
            raise CapacityExceededError("Превышена максимальная вместимость")
        self._current_passengers += count

    def leave_passengers(self, count: int) -> None:
        if count <= 0:
            raise ValueError("count должен быть > 0")
        if count > self._current_passengers:
            raise ValueError("Нельзя высадить больше пассажиров")
        self._current_passengers -= count
`;

  const task2Solution = `
from decimal import Decimal
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
    MIN_TOP_UP_AMOUNT = Decimal("100.00")

    def __init__(
        self,
        card_id: str,
        balance: Decimal = Decimal("0.00"),
        discount_rate: Decimal = Decimal("0.00")
    ):
        if not card_id or not card_id.strip():
            raise ValueError("card_id не может быть пустым")
        if balance < Decimal("0.00"):
            raise ValueError("balance не может быть отрицательным")
        if discount_rate < Decimal("0.00") or discount_rate > Decimal("1.00"):
            raise ValueError("discount_rate должен быть в [0.0; 1.0]")
        self._card_id = card_id.strip()
        self._balance = balance
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

    def top_up(self, amount: Decimal) -> None:
        if self._is_blocked:
            raise CardBlockedError("Карта заблокирована")
        if amount < self.MIN_TOP_UP_AMOUNT:
            raise ValueError("Минимальная сумма 100")
        self._balance += amount

    def pay(self, fare: Decimal) -> Decimal:
        if self._is_blocked:
            raise CardBlockedError("Карта заблокирована")
        if fare <= Decimal("0.00"):
            raise ValueError("fare должен быть > 0")
        effective_fare = fare * (Decimal("1.00") - self._discount_rate)
        if self._balance < effective_fare:
            raise InsufficientFundsError("Недостаточно средств")
        self._balance -= effective_fare
        return effective_fare

    def block(self, reason: str = "") -> None:
        self._is_blocked = True

    def unblock(self) -> None:
        self._is_blocked = False

class SingleTripTicket:
    VALIDITY_SECONDS = 3600

    def __init__(self, ticket_code: str, price: Decimal, issued_at: datetime):
        if not ticket_code or not ticket_code.strip():
            raise ValueError("ticket_code не может быть пустым")
        if price <= Decimal("0.00"):
            raise ValueError("price должен быть > 0")
        self._ticket_code = ticket_code.strip()
        self._price = price
        self._issued_at = issued_at
        self._is_validated = False
        self._validated_bus = None

    @property
    def ticket_code(self) -> str:
        return self._ticket_code

    @property
    def price(self) -> Decimal:
        return self._price

    @property
    def issued_at(self) -> datetime:
        return self._issued_at

    @property
    def is_validated(self) -> bool:
        return self._is_validated

    @property
    def validated_bus(self):
        return self._validated_bus

    def validate(self, bus, current_time: datetime) -> None:
        if not hasattr(bus, "plate_number"):
            raise TypeError("bus должен иметь госномер")
        if self._is_validated:
            raise TicketAlreadyUsedError("Билет уже использован")
        if (current_time - self._issued_at).total_seconds() > self.VALIDITY_SECONDS:
            raise TicketExpiredError("Срок действия билета истек")
        self._is_validated = True
        self._validated_bus = bus
`;

  it('should successfully pass all tests for Task 1 (Bus & Route)', () => {
    const fullCode = `${task1Solution}\n\n${week1PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты первой практической задачи успешно пройдены!');
  });

  it('should successfully pass all tests for Task 2 (TransitCard & SingleTripTicket)', () => {
    const fullCode = `${task2Solution}\n\n${week1HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты домашнего задания успешно пройдены!');
  });

  it('should reject invalid solution for Task 1 that exceeds capacity', () => {
    const buggyTask1 = `
${task1Solution}
# Переопределяем метод board_passengers с багом (нет проверки вместимости)
def buggy_board(self, count):
    self._current_passengers += count
Bus.board_passengers = buggy_board
`;
    const fullCode = `${buggyTask1}\n\n${week1PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });

  it('should reject invalid solution for Task 2 that allows double validation of ticket', () => {
    const buggyTask2 = `
${task2Solution}
# Переопределяем validate с багом (разрешает повторную валидацию)
def buggy_validate(self, bus, current_time):
    self._is_validated = True
    self._validated_bus = bus
SingleTripTicket.validate = buggy_validate
`;
    const fullCode = `${buggyTask2}\n\n${week1HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });
});
