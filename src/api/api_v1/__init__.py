from fastapi import APIRouter
from core.config import settings
from .employees import router as employees_router

router = APIRouter(
    prefix=settings.api.v1.prefix,
)
router.include_router(
    employees_router,
    prefix=settings.api.v1.employees,
)
