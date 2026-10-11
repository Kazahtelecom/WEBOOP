import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { week2Lecture, week2PracticeTask, week2HomeworkTask } from '../src/data/week2';

describe('Week 2 Curriculum and Tasks Structure', () => {
  it('should have 4 interactive quick-checks in Week 2 lecture', () => {
    expect(week2Lecture.id).toBe('week-2-lecture');
    expect(week2Lecture.durationMinutes).toBe(45);
    expect(week2Lecture.quickChecks.length).toBe(4);

    for (const qc of week2Lecture.quickChecks) {
      expect(qc.id).toBeTruthy();
      expect(qc.question).toBeTruthy();
      expect(qc.options.length).toBeGreaterThanOrEqual(3);
      expect(qc.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(qc.correctOptionIndex).toBeLessThan(qc.options.length);
      expect(qc.explanation).toBeTruthy();
    }
  });

  it('should allocate exactly 15 points for practice and 10 points for homework', () => {
    expect(week2PracticeTask.scorePoints).toBe(15);
    expect(week2HomeworkTask.scorePoints).toBe(10);
    expect(week2PracticeTask.scorePoints + week2HomeworkTask.scorePoints).toBe(25);
  });
});

describe('Week 2 Python Runtime Verification', () => {
  const practiceSolution = `
from decimal import Decimal, ROUND_HALF_UP

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

class FareCalculator:
    def __init__(
        self,
        base_fare: Decimal,
        discount_policy: DiscountPolicy,
        zone_policy: ZoneMultiplierPolicy
    ):
        if base_fare <= Decimal("0.00"):
            raise ValueError("base_fare должен быть > 0")
        if not isinstance(discount_policy, DiscountPolicy):
            raise TypeError("discount_policy должен быть экземпляром DiscountPolicy")
        if not isinstance(zone_policy, ZoneMultiplierPolicy):
            raise TypeError("zone_policy должен быть экземпляром ZoneMultiplierPolicy")
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
        zoned = self._base_fare * self._zone_policy.multiplier
        final = self._discount_policy.apply(zoned)
        return final.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
`;

  const homeworkSolution = `
${practiceSolution}

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

class DynamicFareCalculator:
    def __init__(
        self,
        base_fare: Decimal,
        discount_policy: DiscountPolicy,
        zone_policy: ZoneMultiplierPolicy,
        time_policy: TimeMultiplierPolicy | None = None
    ):
        if base_fare <= Decimal("0.00"):
            raise ValueError("base_fare должен быть > 0")
        if not isinstance(discount_policy, DiscountPolicy):
            raise TypeError("discount_policy должен быть экземпляром DiscountPolicy")
        if not isinstance(zone_policy, ZoneMultiplierPolicy):
            raise TypeError("zone_policy должен быть экземпляром ZoneMultiplierPolicy")
        if time_policy is not None and not isinstance(time_policy, TimeMultiplierPolicy):
            raise TypeError("time_policy должен быть экземпляром TimeMultiplierPolicy")
        
        self._base_fare = base_fare
        self._discount_policy = discount_policy
        self._zone_policy = zone_policy
        self._time_policy = time_policy if time_policy is not None else StandardTimePolicy()

    @property
    def base_fare(self) -> Decimal:
        return self._base_fare

    @property
    def discount_policy(self) -> DiscountPolicy:
        return self._discount_policy

    @property
    def zone_policy(self) -> ZoneMultiplierPolicy:
        return self._zone_policy

    @property
    def time_policy(self) -> TimeMultiplierPolicy:
        return self._time_policy

    def set_discount_policy(self, policy: DiscountPolicy) -> None:
        if not isinstance(policy, DiscountPolicy):
            raise TypeError("policy должен быть экземпляром DiscountPolicy")
        self._discount_policy = policy

    def set_zone_policy(self, policy: ZoneMultiplierPolicy) -> None:
        if not isinstance(policy, ZoneMultiplierPolicy):
            raise TypeError("policy должен быть экземпляром ZoneMultiplierPolicy")
        self._zone_policy = policy

    def set_time_policy(self, policy: TimeMultiplierPolicy) -> None:
        if not isinstance(policy, TimeMultiplierPolicy):
            raise TypeError("policy должен быть экземпляром TimeMultiplierPolicy")
        self._time_policy = policy

    def calculate_fare(self) -> Decimal:
        gross = self._base_fare * self._zone_policy.multiplier * self._time_policy.multiplier
        final = self._discount_policy.apply(gross)
        return final.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
`;

  it('should pass all tests for Week 2 practice task (FareCalculator & Policies)', () => {
    const fullCode = `${practiceSolution}\n\n${week2PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты первой практической задачи Недели 2 успешно пройдены!');
  });

  it('should pass all tests for Week 2 homework task (DynamicFareCalculator & TimePolicies)', () => {
    const fullCode = `${homeworkSolution}\n\n${week2HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], {
      encoding: 'utf-8',
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Все тесты домашнего задания Недели 2 успешно пройдены!');
  });

  it('should reject invalid practice solution that accepts negative base_fare', () => {
    const buggyCode = practiceSolution.replace(
      'if base_fare <= Decimal("0.00"):\n            raise ValueError("base_fare должен быть > 0")',
      'pass'
    );
    const fullCode = `${buggyCode}\n\n${week2PracticeTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });

  it('should reject invalid homework solution without type checking in setter', () => {
    const buggyCode = homeworkSolution.replace(
      'if not isinstance(policy, DiscountPolicy):\n            raise TypeError("policy должен быть экземпляром DiscountPolicy")',
      'pass'
    );
    const fullCode = `${buggyCode}\n\n${week2HomeworkTask.testCode}`;
    const result = spawnSync('python', ['-c', fullCode], { encoding: 'utf-8' });

    expect(result.status).not.toBe(0);
  });
});
