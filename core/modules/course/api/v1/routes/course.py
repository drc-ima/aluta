import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.course.schemas.requests.course import CreateCourseRequest
from modules.course.services.course import CourseServices
from modules.school.schemas.responses import SchoolResponse
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(tags=["Staff", "Schools"])


@router.get("/{school_id}", status_code=200)
def school_courses(
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("courses:write", "courses:read")),
):
    try:
        logger.info(f"Router: Fetching school courses.")
        courses = CourseServices.get_school_courses(db, school_id)

        return courses
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching courses - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching courses - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching courses: {str(e)}"
        )


@router.post("/{school_id}", status_code=201, response_model=SchoolResponse)
def create_school_course(
    school_id: uuid.UUID,
    request: CreateCourseRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("courses:write")
    )
):
    try:
        logger.info(f"Router: Creating school course")
    
        CourseServices.create_school_course(db, request, school_id)
    
        return SchoolResponse(
            message="New course added", school_id=school_id
        )
    
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating course - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating course - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating course: {str(e)}"
        )
