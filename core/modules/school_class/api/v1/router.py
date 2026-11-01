from fastapi import APIRouter
from modules.school_class.api.v1.routes import school_class

class_router = APIRouter()

class_router.include_router(
    school_class.router,
    tags=["Classes"]
)

