import logging
from dataclasses import dataclass
from typing import Sequence
from sqlalchemy import or_, select, delete
from sqlalchemy.ext.asyncio import AsyncSession


from core.models import Task
from core.schemas import TaskRequest

logger = logging.getLogger(__name__)


class TaskCRUD:
    """
    Класс для CRUD операций с задачами.
    """

    def __init__(self, db: AsyncSession):
        """
        Инициализация CRUD класса для задач.

        :param db: асинхронная сессия базы данных
        """
        self.db = db

    async def create(self, task: TaskRequest) -> dict[str, int | str]:
        """
        Создание новой задачи.

        :param task: данные для создания задачи
        :return: словарь с результатом операции
        """
        task_db = Task(**task.model_dump())

        if not task_db:
            return {"status": 404, "message": "Task Creation Failed!"}

        async with self.db as session:
            session.add(task_db)
            await session.commit()
            await session.refresh(task_db)

        return {"status": 201, "message": "Successfully Created!", "id": task_db.id}

    async def get_all(self) -> Sequence[Task] | dict[str, int | str]:
        """
        Получение всех записей.

        :return: последовательность всех записей
        """
        async with self.db as session:
            result = await session.execute(select(Task))
            return result.scalars().all()

    async def get_by_query(self, query: str) -> Sequence[Task] | dict[str, int | str]:
        """
        Получение всех записей на основе предоставленного запроса по одному из них:

        - title
        - priority
        - label
        :param query: поисковый запрос
        :return: последовательность найденных задач
        """
        async with self.db as session:
            stmt = select(Task).filter(
                or_(
                    Task.title.ilike(f"%{query}%"),
                    Task.label == query,
                    Task.priority == query,
                )
            )
            result = await session.execute(stmt)
            return result.scalars().all()

    async def update(self, task_id: int, task: TaskRequest) -> dict[str, int | str]:
        """
        Обновление задачи по ID.

        :param task_id: ID задачи для обновления
        :param task: новые данные для задачи
        :return: словарь с результатом операции
        """
        async with self.db as session:
            stmt = select(Task).filter(Task.id == task_id)
            result = await session.execute(stmt)
            db_task = result.scalars().first()

            if not db_task:
                return {
                    "status": 404,
                    "message": f"Updating failed, Task not found!",
                    "id": task_id,
                }

            updated_data = task.model_dump(exclude_unset=True)
            logger.debug(f"Updating task with data: {updated_data}")

            for key, value in updated_data.items():
                if hasattr(db_task, key):
                    setattr(db_task, key, value)
                    logger.debug(f"Set {key} to {value}")
                else:
                    logger.error(f"Attribute {key} does not exist on Task model")

            await session.commit()
            await session.refresh(db_task)

            return {"status": 200, "message": "Successfully Updated!", "id": task_id}

    async def delete_by_id(self, task_id: int) -> dict[str, int | str]:
        """
        Удаление задачи по ID.

        :param task_id: ID задачи для удаления
        :return: словарь с результатом операции
        """
        async with self.db as session:
            stmt = select(Task).filter(Task.id == task_id)
            result = await session.execute(stmt)
            db_task = result.scalars().first()

            if not db_task:
                return {
                    "status": 404,
                    "message": f"Deletion failed, Task not found!",
                    "id": task_id,
                }

            await session.delete(db_task)
            await session.commit()

        return {"status": 200, "message": "Successfully Deleted!", "id": task_id}

    async def delete_all_by_status(self, status: str) -> dict[str, int | str]:
        """
        Удаление всех задач с определенным статусом.

        :param status: статус задач для удаления
        :return: словарь с результатом операции
        """
        if status not in ["backlog", "todo", "in progress", "done"]:
            return {"status": 404, "message": "Invalid status value"}

        async with self.db as session:
            async with session.begin():
                stmt = delete(Task).filter(Task.status == status)
                await session.execute(stmt)
                await session.commit()

        return {"status": 200, "message": "Tasks Successfully Deleted!"}


@dataclass(frozen=True)
class TaskManager:
    """
    Менеджер для управления CRUD операциями с задачами.
    """

    crud: TaskCRUD


async def get_task_manager(db: AsyncSession) -> TaskManager:
    """
    Получение менеджера задач.

    :param db: асинхронная сессия базы данных
    :return: экземпляр TaskManager
    """
    crud = TaskCRUD(db=db)
    return TaskManager(crud=crud)
