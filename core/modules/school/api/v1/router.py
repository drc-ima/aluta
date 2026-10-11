from fastapi import APIRouter
from modules.school.api.v1.routes import school

school_router = APIRouter()

school_router.include_router(
    school.router,
    tags=["School"]
)