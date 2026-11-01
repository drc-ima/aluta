import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from middlewares.logging.logger import logger
from modules.school.schemas.requests.classrooms import BulkCreateClassroomsRequest
from modules.school.schemas.responses import SchoolResponse
from modules.school.services.classroom import ClassroomServices
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(prefix="/classrooms", tags=["Schools", "Classrooms"])

@router.post("/{school_id}/{academic_period_id}")
async def create_ap_classrooms(
    school_id: uuid.UUID,
    academic_period_id: uuid.UUID,
    request: BulkCreateClassroomsRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("academics:write"))
):

    try:
        logger.info(f"Router: Registering a school...")

        await ClassroomServices.create_bulk_classrooms(db, academic_period_id, request)

        return SchoolResponse(
            message="New classrooms created", school_id=school_id
        )
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating classrooms - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating classrooms - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating classrooms: {str(e)}"
        )


@router.get("/{school_id}/{academic_period_id}")
def ap_classrooms(
    school_id: uuid.UUID,
    academic_period_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("academics:write", "academics:read"))
):

    try:
        logger.info(f"Router: Registering a school...")

        classrooms = ClassroomServices.fetch_classrooms(db, academic_period_id)

        return classrooms
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating classrooms - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating classrooms - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating classrooms: {str(e)}"
        )