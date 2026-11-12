from fastapi import APIRouter
from modules.school.api.v1.routes import (
    academic_period, 
    classroom, 
    enrollment, 
    school
)

school_router = APIRouter()

school_router.include_router(
    school.router,
    tags=["Schools"]
)

school_router.include_router(
    academic_period.router
)

school_router.include_router(
    classroom.router,
)

school_router.include_router(
    enrollment.router
)