import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.student.schemas.requests.student import CreatedStudentRequest
from modules.student.services.student import StudentServices, StudentServices
from modules.school.schemas.responses import SchoolResponse
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(tags=["Staff", "Schools"])


@router.get("/{school_id}", status_code=200)
def school_students(
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("students:write", "students:read")),
    page: int = 1,
    limit: int = 20,
    search: str = "",
    filters: str = "",
    sortBy: str = "",
    sortOrder: str = ""
):
    try:
        logger.info(f"Router: Fetching school students.")
        params = {
            "page": page,
            "limit": limit,
            "search": search,
            "filters": json.loads(filters) if filters else [],
            "sortBy": sortBy,
            "sortOrder": sortOrder
        }
        students = StudentServices.get_school_students(db, school_id, **params)

        return students
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching students - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching students - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching students: {str(e)}"
        )


@router.post("/{school_id}/{campus_id}", status_code=201, response_model=SchoolResponse)
async def create_school_student(
    school_id: uuid.UUID,
    campus_id: uuid.UUID,
    request: CreatedStudentRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("students:write")
    )
):
    try:
        logger.info(f"Router: Creating school student")
    
        await StudentServices.create_campus_student(db, request, campus_id, school_id)
    
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
