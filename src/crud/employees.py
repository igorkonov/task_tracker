from dataclasses import dataclass
from typing import Type

from sqlalchemy import or_, select, delete, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.models import Employee
from core.schemas import EmployeeResponse, EmployeeRequest


class EmployeeCRUD:
    """
    Класс для CRUD операций с сотрудниками.
    """

    def __init__(self, db: AsyncSession):
        """
        Инициализация CRUD класса для сотрудников.

        :param db: асинхронная сессия базы данных
        """
        self.db = db

    async def create(self, employee: EmployeeRequest) -> dict[str, int | str]:
        """
        Создание нового сотрудника.

        :param employee: данные для создания сотрудника
        :return: словарь с результатом операции
        """
        db_employee = Employee(**employee.model_dump())
        if not db_employee:
            return {"status": 404, "message": f"Employee Creation Failed!"}

        async with self.db as session:
            session.add(db_employee)
            await session.commit()
            # Проверка, имеет ли модель отношение tasks
            if hasattr(Employee, "tasks"):
                result = await session.execute(
                    select(Employee)
                    .options(selectinload(Employee.tasks))
                    .filter_by(id=db_employee.id)
                )
                db_employee = result.scalars().one()

        return db_employee

    async def get_all(self) -> Sequence[Employee] | dict[str, int | str]:
        """
        Получение всех cотрудников.

        :return: последовательность всех записей
        """
        async with self.db as session:
            result = await session.execute(
                select(Employee).options(selectinload(Employee.tasks))
            )
            return result.scalars().all()

    async def get_by_query(
        self, query: str
    ) -> Sequence[Employee] | dict[str, int | str]:
        """
        Получение всех записей на основе предоставленного запроса по одному из них:

        - fullname
        - position
        :param query: поисковый запрос
        :return: последовательность найденных сотрудников
        """
        async with self.db as session:
            stmt = (
                select(Employee)
                .options(selectinload(Employee.tasks))
                .filter(
                    or_(
                        Employee.fullname.ilike(f"%{query}%"),
                        Employee.position.ilike(f"%{query}%"),
                    )
                )
            )
            result = await session.execute(stmt)
            employees_db = result.scalars().all()
            return employees_db

    async def update(
        self, employee_id: int, employee: EmployeeRequest
    ) -> dict[str, int | str]:
        """
        Обновление сотрудника по ID.

        :param employee_id: ID сотрудника для обновления
        :param employee: новые данные для сотрудника
        :return: словарь с результатом операции
        """
        async with self.db as session:
            stmt = select(Employee).filter(Employee.id == employee_id)
            result = await session.execute(stmt)
            db_employee = result.scalars().first()

            if not db_employee:
                return {
                    "status": 404,
                    "message": f"Updating failed, Employee not found!",
                    "id": employee_id,
                }

            updated_data = employee.model_dump(exclude_unset=True)

            for key, value in updated_data.items():
                setattr(db_employee, key, value)

            await session.commit()
            await session.refresh(db_employee)

            return {
                "status": 200,
                "message": "Successfully Updated!",
                "id": employee_id,
            }

    async def delete_by_id(self, employee_id: int) -> dict[str, int | str]:
        """
        Удаление сотрудника по ID.

        :param employee_id: ID сотрудника для удаления
        :return: словарь с результатом операции
        """
        async with self.db as session:
            stmt = select(Employee).filter(Employee.id == employee_id)
            result = await session.execute(stmt)
            db_employee = result.scalars().first()

            if not db_employee:
                return {
                    "status": 404,
                    "message": f"Deletion failed, Employee not found!",
                    "id": employee_id,
                }

            await session.delete(db_employee)
            await session.commit()

        return {"status": 200, "message": "Successfully Deleted!", "id": employee_id}

    async def delete_all(self) -> dict[str, int | str]:
        """
        Удаление всех сотрудников.

        :return: словарь с результатом операции
        """
        async with self.db as session:
            async with session.begin():
                stmt = delete(Employee)
                await session.execute(stmt)
                await session.commit()

        return {"status": 200, "message": "Employees Successfully Deleted!"}


@dataclass(frozen=True)
class EmployeeManager:
    """
    Менеджер для управления CRUD операциями с сотрудниками.
    """

    crud: EmployeeCRUD


async def get_employee_manager(db: AsyncSession) -> EmployeeManager:
    """
    Получение менеджера сотрудников.

    :param db: асинхронная сессия базы данных
    :return: экземпляр EmployeeManager
    """
    crud = EmployeeCRUD(db=db)
    return EmployeeManager(crud=crud)
