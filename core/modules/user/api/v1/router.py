from fastapi import APIRouter
from modules.user.api.v1.routes import (
    admin,
    user
)

user_router = APIRouter()

user_router.include_router(
    admin.router,
    tags=["Admin"]
)

user_router.include_router(
    user.router,
    tags=["User"]
)