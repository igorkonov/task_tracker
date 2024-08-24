from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, declared_attr

if TYPE_CHECKING:
    from .employee import Employee


class EmployeeRelationMixin:
    _employee_id_nullable: bool = True
    _employee_id_unique: bool = False
    _employee_back_populates: str | None = None

    @declared_attr
    def employee_id(cls) -> Mapped[int]:
        return mapped_column(
            ForeignKey("employees.id"),
            unique=cls._employee_id_unique,
            nullable=cls._employee_id_nullable,
        )

    @declared_attr
    def employee(cls) -> Mapped["Employee"]:
        return relationship("Employee", back_populates=cls._employee_back_populates)
