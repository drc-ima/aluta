import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.student.schemas.requests.student import CreatestudentRequest
from modules.student.services.student import studentServices
from modules.school.schemas.responses import SchoolResponse
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(tags=["Staff", "Schools"])


@router.get("/{campus_id}", status_code=200)
def campus_students(
    campus_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("students:write", "students:read")),
):
    try:
        logger.info(f"Router: Fetching school students.")
        students = StudentServices.get_campus_students(db, campus_id)

        return students
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching students - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching students - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching students: {str(e)}"
        )


@router.post("/{campus_id}", status_code=201, response_model=SchoolResponse)
def create_school_student(
    school_id: uuid.UUID,
    request: CreatestudentRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("students:write")
    )
):
    try:
        logger.info(f"Router: Creating school student")
    
        studentServices.create_school_student(db, request, school_id)
    
        return SchoolResponse(
            message="New student added", school_id=school_id
        )
    
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating student - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating student - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating student: {str(e)}"
        )
