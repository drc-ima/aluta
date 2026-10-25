from fastapi import APIRouter
from modules.staff.api.v1.routes import department, position, staff

staff_router = APIRouter()

staff_router.include_router(
    position.router,
    tags=["Positions"]
)

staff_router.include_router(
    department.router
)

staff_router.include_router(
    staff.router
)