from sqlalchemy import String, LargeBinary
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from .base import Base


class Employee(Base):
    __tablename__ = "employees"

    fullname: Mapped[str] = mapped_column(String(50), unique=True)
    age: Mapped[int] = mapped_column(String(10))
    email: Mapped[str | None] = mapped_column(String(50), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(1024), unique=True)
    refresh_token: Mapped[str | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(default=True)

    def __str__(self):
        return self.fullname

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, fullname={self.fullname!r}, age={self.age!r})"
