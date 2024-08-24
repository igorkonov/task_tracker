import logging
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import db_helper
from core.schemas import EmployeeRequest, EmployeeResponse
from crud.employees import get_employee_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/manager/employees", tags=["Employees"])


@router.post(
    path="/new",
    summary="Create a new employee",
    status_code=201,
    response_model=EmployeeResponse,
)
async def create_employee(
    employee: EmployeeRequest,
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)],
):
    """
    Создание нового сотрудника на основе полученных данных.

    :param employee: экземпляр модели pydantic EmployeeRequest
    :param db: сеанс базы данных
    :return: сведения о создании сотрудника, полученные в результате операции создания
    """
    try:
        manager = await get_employee_manager(db=db)
        new_employee = await manager.crud.create(employee=employee)

        return new_employee

    except Exception as exc:
        logger.error(f"Error creating employee: {exc}")
        raise HTTPException(status_code=500, detail="Failed to create employee")


@router.get(
    path="/all",
    summary="Get all employees",
    status_code=200,
    response_model=List[EmployeeResponse],
)
async def get_all_employees(
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> Sequence[EmployeeResponse]:
    """
    Получение всех сотрудников.

    :param db: сеанс базы данных
    :return: список сотрудников (экземпляры EmployeeResponse)
    """
    try:
        manager = await get_employee_manager(db=db)
        all_employees = await manager.crud.get_all()
        return all_employees

    except Exception as exc:
        logger.error(f"Error retrieving employees: {exc}")
        raise HTTPException(status_code=500, detail="Failed to retrieve employees")


@router.get(
    path="/query",
    summary="Get employees by query",
    status_code=200,
    response_model=List[EmployeeResponse],
)
async def get_employees_by_query(
    query: str, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> Sequence[EmployeeResponse]:
    """
    Получение сотрудников на основе запроса.

    :param query: поисковый запрос
    :param db: сеанс базы данных
    :return: список сотрудников (экземпляры EmployeeResponse)
    """
    try:
        manager = await get_employee_manager(db=db)
        employees_by_query = await manager.crud.get_by_query(query=query)

        return employees_by_query

    except Exception as exc:
        logger.error(f"Error retrieving employees by query: {exc}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve employees by query"
        )


@router.put(
    path="/update/{employee_id}",
    summary="Update employee by id",
    status_code=200,
    response_model=EmployeeResponse,
)
async def update_employee(
    employee_id: int,
    employee: EmployeeRequest,
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)],
) -> dict[str, int | str]:
    """
    Обновление данных сотрудника на основе его идентификатора с обновленными полями.

    :param employee_id: идентификатор сотрудника
    :param employee: экземпляр модели pydantic EmployeeRequest (обновленные поля)
    :param db: сеанс базы данных
    :return: сведения об изменении данных сотрудника, полученные в результате операции обновления.
    """
    try:
        manager = await get_employee_manager(db=db)
        updated_employee = await manager.crud.update(
            employee_id=employee_id, employee=employee
        )
        return updated_employee

    except Exception as exc:
        logger.error(f"Error updating employee with id {employee_id}: {exc}")
        raise HTTPException(
            status_code=500, detail=f"Failed to update employee with id {employee_id}"
        )


@router.delete(
    path="/delete/{employee_id}",
    summary="Delete employee by id",
    status_code=200,
    response_model=dict,
)
async def delete_employee_by_id(
    employee_id: int, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> dict[str, int | str]:
    """
    Удаление сотрудника по его идентификатору.

    :param employee_id: идентификатор сотрудника
    :param db: сеанс базы данных
    :return: сведения об удалении сотрудника, полученные в результате операции delete_by_id
    """
    try:
        manager = await get_employee_manager(db=db)
        delete_employee = await manager.crud.delete_by_id(employee_id=employee_id)
        return delete_employee

    except Exception as exc:
        logger.error(f"Error deleting employee with id {employee_id}: {exc}")
        raise HTTPException(
            status_code=500, detail=f"Failed to delete employee with id {employee_id}"
        )


@router.delete(
    path="/delete/",
    summary="Delete all employees ",
    status_code=200,
    response_model=dict,
)
async def delete_all_employees(
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> dict[str, int | str]:
    """
    Удаление всех сотрудников.

    :param db: сеанс базы данных
    :return: сведения об удалении сотрудников, полученные в результате операции delete_all
    """
    try:
        manager = await get_employee_manager(db=db)
        delete_employees = await manager.crud.delete_all()
        return delete_employees

    except Exception as exc:
        logger.error(f"Error deleting all employees: {exc}")
        raise HTTPException(status_code=500, detail="Failed to delete all employees")
