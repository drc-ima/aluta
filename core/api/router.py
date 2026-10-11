from fastapi import APIRouter

from modules.user.api.v1.router import user_router
from modules.token.api.v1.router import token_router
from modules.school.api.v1.router import school_router
api_router = APIRouter()

api_router.include_router(
    user_router,
    prefix="/v1/user"
)

api_router.include_router(
    token_router,
    prefix="/v1/token"
)

api_router.include_router(
    school_router,
    prefix="/v1/school"
)