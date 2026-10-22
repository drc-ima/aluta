import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from middlewares.logging.logger import logger
from modules.staff.schemas.requests.department import CreateSchoolDepartmentRequest
from modules.school.schemas.responses import SchoolResponse
from modules.staff.services.department import DepartmentServices
from shared.data.schemas.domain import DepartmentDomain
from shared.data.session import get_db
from shared.utils.permissions import require_permission, school_require_permission

router = APIRouter(prefix="/departments", tags=["Schools", "Departments"])

@router.get(
    "/{school_id}"
)
def school_departments(
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("staff:read", "staff:write")
    ),
):
    try:
        logger.info(f"Router: Fetching academic periods for a campus")
    
        departments: list[DepartmentDomain] = (
            DepartmentServices.get_school_departments(db, school_id)
        )
    
        return departments

    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching departments - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching departments - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching departments: {str(e)}"
        )


@router.post(
    "/{school_id}",
    response_model=SchoolResponse
)
def create_school_department(
    body: CreateSchoolDepartmentRequest,
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("staff:read", "staff:write")
    )
): 

    try:
        logger.info(f"Router: Fetching academic periods for a campus")

        DepartmentServices.add_school_department(db, body, school_id)

        return SchoolResponse(
            message="New department added", school_id=school_id
        )

    except HTTPException as e:
        logger.error(f"Router: HTTP error creating department - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating department - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating department: {str(e)}"
        )
    

