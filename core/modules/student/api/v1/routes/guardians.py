
import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.student.services.guardian import GuardianServices
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(prefix="/guardians", tags=["Guardians", "Schools"])

@router.get(
    "/{school_id}",
    status_code=200
)
def school_guardians(
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
        logger.info(f"Router: Fetching school guardians.")
        params = {
            "page": page,
            "limit": limit,
            "search": search,
            "filters": json.loads(filters) if filters else [],
            "sortBy": sortBy,
            "sortOrder": sortOrder
        }
        guardians: dict = GuardianServices.get_school_guardians(db, school_id, **params)

        return guardians
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching guardians - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching guardians - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching guardians: {str(e)}"
        )