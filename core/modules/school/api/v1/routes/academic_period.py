import uuid

from fastapi import APIRouter, Depends, HTTPException

from middlewares.logging.logger import logger
from modules.school.schemas.requests.academic_period import (
    CreateCampusAcademicPeriodRequest,
)
from modules.school.schemas.responses import SchoolResponse
from modules.school.services.academic_period import AcademicPeriodServices
from shared.data.schemas.domain import AcademicPeriodDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException
from shared.utils.permissions import school_require_permission
from shared.data.session import get_db, get_user
from sqlalchemy.orm import Session

router = APIRouter(prefix="/academic-periods", tags=["Schools", "Academic Periods"])


@router.get("/{school_id}/{campus_id}")
def campus_academic_periods(
    school_id: uuid.UUID,
    campus_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        logger.info(f"Router: Fetching academic periods for a campus")

        academic_periods: list[AcademicPeriodDomain] = (
            AcademicPeriodServices.get_campus_nested_periods(db, campus_id)
        )

        return academic_periods
    except RecordAlreadyExistsException as e:
        logger.error(f"Router: Academic Period already exists - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching academic periods - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching academic periods - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching academic periods: {str(e)}"
        )


@router.post("/{school_id}/{campus_id}", response_model=SchoolResponse)
def create_campus_academic_period(
    school_id: uuid.UUID,
    campus_id: uuid.UUID,
    body: CreateCampusAcademicPeriodRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("academics:write")),
):

    try:
        logger.info(f"Router: Registering a school...")

        AcademicPeriodServices.add_academic_periods(db, campus_id, school_id, body, user)

        return SchoolResponse(
            message="New academic period created", school_id=school_id
        )
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating academic period - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating academic period - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating academic period: {str(e)}"
        )
    
