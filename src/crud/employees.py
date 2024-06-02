from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import Employee
from core.schemas.employee import EmployeeCreate


async def get_all_employees(
    session: AsyncSession,
) -> Sequence[Employee]:
    stmt = select(Employee).order_by(Employee.id)
    result = await session.scalars(stmt)
    return result.all()


async def create_employee(
    session: AsyncSession,
    employee_create: EmployeeCreate,
) -> Employee:
    employee = Employee(**employee_create.model_dump())
    session.add(employee)
    await session.commit()
    await session.refresh(employee)
    return employee
