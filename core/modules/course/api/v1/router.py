from fastapi import APIRouter
from modules.course.api.v1.routes import course

course_router = APIRouter()

course_router.include_router(
    course.router,
    tags=["Course"]
)

