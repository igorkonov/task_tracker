from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.networks import EmailStr

from .task import TaskResponse


class EmployeeRequest(BaseModel):
    """
    Представляет структуру запроса для создания или обновления сотрудника.
    """

    fullname: str = None
    position: str = None
    age: Optional[int] = None
    email: Optional[EmailStr] = None
    hashed_password: Optional[str] = None
    refresh_token: Optional[str] = None
    is_active: bool = True

    @field_validator("email", mode="before")
    def validate_email(cls, v):
        return v or None  # Заменяем пустую строку на None

    @field_validator("age", mode="before")
    def validate_age(cls, v):
        if v is not None and (v < 18 or v > 150):
            raise ValueError(
                "Возраст сотрудника должен быть в пределах от 18 до 150 лет"
            )
        return v


class EmployeeResponse(EmployeeRequest):
    """
    Представляет структуру схемы, используемую для чтения данных о сотруднике.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    tasks: Optional[List[TaskResponse]] = (
        None  # Список идентификаторов задач сотрудника
    )
