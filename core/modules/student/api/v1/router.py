from fastapi import APIRouter
from modules.student.api.v1.routes import student

student_router = APIRouter()

student_router.include_router(
    student.router,
    tags=["Student"]
)

