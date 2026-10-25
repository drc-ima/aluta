import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.staff.schemas.requests.staff import NewStaffRequest
from modules.staff.services.staff import StaffServices
from shared.data.schemas.domain import StaffDomain
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission

router = APIRouter(tags=["Staff", "Schools"])


@router.get("/{school_id}", status_code=200)
def school_staff(
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("staff:write", "staff:read")),
    page: int = 1,
    page_size: int = 1,
    term: str = "",
):
    try:
        logger.info(f"Router: Fetching staff")

        staff: dict = StaffServices.get_school_staff(db, school_id=school_id)
        return staff

    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching staff - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching staff - {e}")
        raise HTTPException(status_code=500, detail=f"Failed fetching staff: {str(e)}")


@router.post("/{school_id}", status_code=200)
def create_school_staff(
    school_id: uuid.UUID,
    request: NewStaffRequest,
    db: Session = Depends(get_db),
):
    try:
        logger.info(f"Router: Creting new staff.")

        staff: StaffDomain = StaffServices.add_school_staff(db, school_id, request)

        return staff
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating staff - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating staff - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating staff: {str(e)}"
        )
