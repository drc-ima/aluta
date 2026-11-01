import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.school.schemas.responses import SchoolResponse
from modules.school_class.schemas.requests.school_class import CreateSchoolClassRequest
from modules.school_class.services.school_class import SchoolClassServices
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(tags=["Classes", "Schools"])


@router.get("/{school_id}/{campus_id}", status_code=200)
def campus_klasses(
    campus_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(school_require_permission("classes:write", "classes:read")),
):
    try:
        logger.info(f"Router: Fetching school classes.")
        classes = SchoolClassServices.get_campus_classes(db, campus_id)

        return classes
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching classes - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching classes - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching classes: {str(e)}"
        )

@router.post(
    "/{school_id}/{campus_id}", 
    status_code=201, 
    response_model=SchoolResponse
)
def create_campus_klasses(
    request: CreateSchoolClassRequest,
    school_id: uuid.UUID,
    campus_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("classes:write")
    )
):
    try:
        logger.info("Router: Creating range of classes")

        SchoolClassServices.create_range_class(db, campus_id, request)

        return SchoolResponse(
            message="Range of classes created", school_id=school_id
        )

    except HTTPException as e:
        logger.error(f"Router: HTTP error creating school class - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating school class - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating school class: {str(e)}"
        )

