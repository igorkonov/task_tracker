from pydantic import BaseModel
from pydantic import ConfigDict


class EmployeeBase(BaseModel):
    fullname: str
    age: int
    email: str | None
    hashed_password: str
    refresh_token: str | None
    is_active: bool


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(
        from_attributes=True,
    )
    id: int
