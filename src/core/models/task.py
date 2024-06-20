from datetime import datetime, timedelta
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from .base import Base
from .mixin import EmployeeRelationMixin


class Task(Base, EmployeeRelationMixin):
    _employee_back_populates = "tasks"

    title: Mapped[str] = mapped_column(index=True, default="Untitled")
    description: Mapped[str | None]
    label: Mapped[str | None]
    priority: Mapped[str] = mapped_column(index=True, default="medium")
    status: Mapped[str] = mapped_column(default="backlog")
    attachment: Mapped[str | None]

    created_at: Mapped[str] = mapped_column(
        default=datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    last_update: Mapped[str] = mapped_column(
        default=datetime.now().strftime("%Y-%m-%d %H:%M"),
        onupdate=datetime.now().strftime("%Y-%m-%d %H:%M"),
    )
    completed_at: Mapped[str] = mapped_column(
        default=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M")
    )

    def __str__(self):
        return f"{self.title} - {self.status}"

    def __repr__(self):
        return f"{self.__class__.__name__}(id={self.id}, title={self.title!r}, status={self.status!r})"
