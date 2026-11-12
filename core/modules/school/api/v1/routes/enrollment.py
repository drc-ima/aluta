

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.school.schemas.requests.enrollment import EnrollStudentRequest
from modules.school.schemas.responses import SchoolResponse
from modules.school.services.enrollment import EnrollmentServices
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission

router = APIRouter(prefix="/enrollments", tags=["Schools", "Enrollments"])

@router.post(
    "/{school_id}",
    status_code=201,
    response_model=SchoolResponse
)
def enroll_student(
    school_id: uuid.UUID,
    request: EnrollStudentRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("students:write", "academics:write")
    )
):
    try:
        logger.info(f"Router: Enrolling school student")
    
        EnrollmentServices.create_enrollment(db, request)
    
        return SchoolResponse(
            message="New student enrolled", school_id=school_id
        )
    
    except HTTPException as e:
        logger.error(f"Router: HTTP error enrolling student - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error enrolling student - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  enrolling student: {str(e)}"
        )
    