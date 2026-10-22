from fastapi import APIRouter

from modules.user.api.v1.router import user_router
from modules.token.api.v1.router import token_router
from modules.school.api.v1.router import school_router
from modules.staff.api.v1.router import staff_router

api_router = APIRouter()

api_router.include_router(
    user_router,
    prefix="/user"
)

api_router.include_router(
    token_router,
    prefix="/token"
)

api_router.include_router(
    school_router,
    prefix="/school"
)

api_router.include_router(
    staff_router,
    prefix="/staff"
)