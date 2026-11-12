from fastapi import APIRouter

from modules.user.api.v1.router import user_router
from modules.token.api.v1.router import token_router
from modules.school.api.v1.router import school_router
from modules.staff.api.v1.router import staff_router
from modules.course.api.v1.router import course_router
from modules.school_class.api.v1.router import class_router
from modules.student.api.v1.router import student_router

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
    prefix="/school",
    tags=["School Module"]
)

api_router.include_router(
    staff_router,
    prefix="/staff",
    tags=["Staff Module"]
)

api_router.include_router(
    course_router,
    prefix="/courses",
    tags=["Course Module"]
)

api_router.include_router(
    class_router,
    prefix="/classes",
    tags=["Class Module"]
)

api_router.include_router(
    student_router,
    prefix="/students",
    tags=["Student Module"]
)