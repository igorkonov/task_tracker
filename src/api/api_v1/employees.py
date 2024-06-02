from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import db_helper, Employee
from core.schemas.employee import (
    EmployeeRead,
    EmployeeCreate,
)
from crud import employees as employees_crud

router = APIRouter(
    tags=["Employees"],
)


@router.get("", response_model=list[EmployeeRead])
async def get_employees(
    session: Annotated[
        AsyncSession,
        Depends(db_helper.session_getter),
    ],
):
    employees = await employees_crud.get_all_employees(session=session)
    return employees


@router.post("", response_model=EmployeeRead)
async def create_employee(
    session: Annotated[
        AsyncSession,
        Depends(db_helper.session_getter),
    ],
    employee_create: EmployeeCreate,
) -> Employee:
    employee = await employees_crud.create_employee(
        session=session,
        employee_create=employee_create,
    )
    return employee
