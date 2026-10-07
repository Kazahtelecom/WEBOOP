"""Object-oriented probe for the WEBOOP course, run inside Pyodide.

Purpose: answer the open question from research iteration 1 (RES Q2) with a real run rather
than with reasoning -- does the course need micropip and an external package, or is the
standard library enough?

The probe covers exactly the three declared weeks of the course and nothing else:
encapsulation, then inheritance and composition, then polymorphism and abstractions.
It deliberately avoids exceptions, files, threads and sockets, which the course places
out of scope and which Pyodide does not fully support.
"""

from __future__ import annotations

# Only the standard library is imported. If any import below fails inside Pyodide, that is
# the finding: the course would need micropip, and the probe reports it instead of hiding it.
import json  # noqa: F401  (used by index.html for the result envelope)
from abc import ABC, abstractmethod
from dataclasses import dataclass


class Account:
    """Week 1 -- encapsulation: state is private and changes only through its own methods."""

    def __init__(self, owner: str, balance: int = 0) -> None:
        self._owner = owner
        self._balance = balance

    @property
    def owner(self) -> str:
        return self._owner

    @property
    def balance(self) -> int:
        return self._balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount

    def withdraw(self, amount: int) -> bool:
        if amount <= 0 or amount > self._balance:
            return False
        self._balance -= amount
        return True


class SavingsAccount(Account):
    """Week 2 -- inheritance: reuse the base contract, add one behaviour."""

    def __init__(self, owner: str, balance: int = 0, rate_percent: int = 5) -> None:
        super().__init__(owner, balance)
        self._rate_percent = rate_percent

    def accrue(self) -> int:
        interest = self._balance * self._rate_percent // 100
        self.deposit(interest)
        return interest


@dataclass
class Statement:
    """Week 2 -- composition: an account has a statement, it is not a kind of statement."""

    account: Account
    operations: int = 0

    def describe(self) -> str:
        return f"{self.account.owner}: {self.account.balance} ({self.operations} операций)"


class Shape(ABC):
    """Week 3 -- abstraction: a base type that names the required behaviour only."""

    @abstractmethod
    def area(self) -> int:
        raise NotImplementedError

    def describe(self) -> str:
        return f"{type(self).__name__}: площадь {self.area()}"


class Rectangle(Shape):
    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height

    def area(self) -> int:
        return self.width * self.height


class Square(Rectangle):
    """Week 3 -- polymorphism: the same call reaches a different implementation."""

    def __init__(self, side: int) -> None:
        super().__init__(side, side)


def _check(name: str, condition: bool, observed: object) -> dict:
    return {"name": name, "ok": bool(condition), "observed": observed}


def run_probe() -> dict:
    """Run every course-level check and report each result honestly."""
    checks: list[dict] = []

    account = Account("Жасулан", 100)
    account.deposit(50)
    checks.append(_check("week1: deposit changes balance", account.balance == 150, account.balance))

    withdrew = account.withdraw(30)
    checks.append(_check("week1: withdraw returns True and reduces", withdrew and account.balance == 120, account.balance))

    over = account.withdraw(10_000)
    checks.append(_check("week1: withdraw refuses overdraft", over is False and account.balance == 120, account.balance))

    # Encapsulation is real only if the private field is not the public API.
    checks.append(
        _check(
            "week1: state is exposed through properties, not fields",
            hasattr(Account, "balance") and isinstance(Account.balance, property),
            type(getattr(Account, "balance", None)).__name__,
        )
    )

    savings = SavingsAccount("Жасулан", 1000, rate_percent=10)
    interest = savings.accrue()
    checks.append(_check("week2: inheritance adds behaviour", interest == 100 and savings.balance == 1100, interest))

    checks.append(
        _check(
            "week2: subclass is a kind of base",
            isinstance(savings, Account),
            [cls.__name__ for cls in type(savings).__mro__],
        )
    )

    statement = Statement(account, operations=2)
    checks.append(
        _check(
            "week2: composition holds another object",
            statement.describe().startswith("Жасулан: 120"),
            statement.describe(),
        )
    )

    shapes: list[Shape] = [Rectangle(3, 4), Square(5)]
    areas = [shape.area() for shape in shapes]
    checks.append(_check("week3: polymorphism dispatches per type", areas == [12, 25], areas))

    described = [shape.describe() for shape in shapes]
    checks.append(
        _check(
            "week3: inherited describe uses the override",
            described == ["Rectangle: площадь 12", "Square: площадь 25"],
            described,
        )
    )

    abstract_refused = False
    try:
        Shape()  # type: ignore[abstract]
    except TypeError:
        abstract_refused = True
    checks.append(_check("week3: abstract base cannot be instantiated", abstract_refused, abstract_refused))

    return {
        "ok": all(check["ok"] for check in checks),
        # Every import above is standard library. If that ever stops being true, the probe
        # fails loudly and micropip becomes necessary rather than silently assumed.
        "micropip_needed": False,
        "checks": checks,
    }
