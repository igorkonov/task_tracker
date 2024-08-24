from typing import Optional

from enum import Enum
from datetime import datetime, timedelta

from pydantic import BaseModel, ConfigDict


class Priority(str, Enum):
    """
    Представляет специальные значения приоритета задачи.
    """

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Status(str, Enum):
    """
    Представляет специальные значения состояния задачи.
    """

    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in progress"
    DONE = "done"


class TaskRequest(BaseModel):
    """
    Представляет основную схему-структуру задач.
    """

    title: str = "Untitled"
    description: Optional[str] = None
    label: Optional[str] = None
    priority: Priority = Priority.MEDIUM.value
    status: Status = Status.BACKLOG.value
    completed_at: str = (datetime.now() + timedelta(days=7)).strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    attachment: Optional[str] = None


class TaskResponse(TaskRequest):
    """
    Представляет структуру схемы, используемую для чтения задач.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int
    created_at: str
    last_update: str
