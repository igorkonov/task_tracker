import logging
from typing import Annotated, Sequence, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import db_helper
from core.schemas import TaskRequest, TaskResponse
from crud.task import get_task_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/manager/tasks", tags=["Tasks"])


@router.post(path="/new", summary="Creating a new task", status_code=201)
async def create(
    task: TaskRequest, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> dict[str, int | str]:
    """
    Создание новой задачи на основе полученных данных

    :param task: экземпляр модели pydantic TaskCreate
    :param db: сеанс базы данных
    :return: сведения о создании задачи, полученные в результате операции создания
    """
    try:
        manager = await get_task_manager(db=db)
        new_task = await manager.crud.create(task=task)

        return new_task

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.get(
    path="/all",
    summary="Get all tasks",
    status_code=200,
    response_model=List[TaskResponse],
)
async def get_all_tasks(
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> Sequence[TaskResponse]:
    """
    Получение всех задач одновременно

    :param db: сеанс базы данных
    :return: список задач (экземпляры TaskRead)
    """
    try:
        manager = await get_task_manager(db=db)
        all_tasks = await manager.crud.get_all()

        return all_tasks

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.get(
    path="/query",
    summary="Get tasks by query",
    status_code=200,
    response_model=List[TaskResponse],
)
async def get_by_query(
    query: str, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> Sequence[TaskResponse]:
    """
    Получение всех задач на основе запроса.

    :param query: поисковый запрос
    :param db: ceaнс базы данных
    :return: список задач (экземпляры TaskRead)
    """
    try:
        manager = await get_task_manager(db=db)
        tasks_by_query = await manager.crud.get_by_query(query=query)

        return tasks_by_query

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.put(path="/update/{task_id}", summary="Update task by id", status_code=200)
async def update(
    task_id: int,
    task: TaskRequest,
    db: Annotated[AsyncSession, Depends(db_helper.session_getter)],
) -> dict[str, int | str]:
    """
    Обновление задачи на основе идентификатора задачи с обновленными полями.

    :param task_id: идентификатор задачи
    :param task: экземпляр модели pydantic TaskUpdate (обновленные поля)
    :param db: сеанс базы данных
    :return: сведения об изменении задачи, полученные в результате операции обновления.
    """
    try:
        manager = await get_task_manager(db=db)
        update_task = await manager.crud.update(task_id=task_id, task=task)

        return update_task
    except ValueError as ve:
        logger.error(f"Validation error updating task {task_id}: {str(ve)}")
        raise HTTPException(status_code=422, detail=str(ve))

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete(
    path="/delete/id={task_id}", summary="Delete task by id", status_code=200
)
async def delete_by_id(
    task_id: int, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> dict[str, int | str]:
    """
    Удаление задачи по идентификатору задачи.

    :param db: сеанс базы данных
    :param task_id: идентификатор задачи
    :return: сведения об удалении задачи, полученные в результате операции delete_by_id
    """
    try:
        manager = await get_task_manager(db=db)
        delete_task = await manager.crud.delete_by_id(task_id=task_id)

        return delete_task

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete(
    path="/delete/status={status}",
    summary="Delete all tasks according to the status",
    status_code=200,
)
async def delete_all_by_status(
    status: str, db: Annotated[AsyncSession, Depends(db_helper.session_getter)]
) -> dict[str, int | str]:
    """
    Удаление всех задач по статусу, пример: удаление всех «backlog» задач.
    :param status:
    :param db: сеанс базы данных
    :return: сведения об удалении задачи, полученные в результате операции delete_all
    """
    try:
        manager = await get_task_manager(db=db)
        delete_tasks = await manager.crud.delete_all_by_status(status=status)

        return delete_tasks

    except Exception as exc:
        logger.error(msg=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))
