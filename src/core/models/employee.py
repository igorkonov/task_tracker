from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column

from .base import Base

if TYPE_CHECKING:
    from .task import Task


class Employee(Base):

    fullname: Mapped[str] = mapped_column(String(50), unique=True)
    position: Mapped[str] = mapped_column(String(50))
    age: Mapped[int] = mapped_column()
    email: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(1024))
    refresh_token: Mapped[Optional[str]] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    tasks: Mapped[List["Task"]] = relationship(back_populates="employee")

    def __str__(self):
        return self.fullname

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, fullname={self.fullname!r}, age={self.age!r})"
