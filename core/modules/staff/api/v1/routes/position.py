import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.staff.schemas.requests.position import CreatePositionRequest
from modules.staff.services.position import PositionServices
from shared.data.session import get_db
from shared.utils.permissions import school_require_permission


router = APIRouter(prefix="/positions", tags=["Staff", "Positions"])

@router.post(
    "/{school_id}",
    status_code=201,
    response_class=JSONResponse
)
def create_school_position(
    school_id: uuid.UUID,
    request: CreatePositionRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("staff:write")
    ),
    
):

    try:
        logger.info(f"Router: Creating a new position...")

        positions = PositionServices.add_school_position(db, request, school_id)

        return JSONResponse(
            content={"data": positions},
            status_code=201
        )
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating position - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating position - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  creating position: {str(e)}"
        )

@router.get(
    "/{school_id}",
    status_code=200
)
def get_school_positions(
    school_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(
        school_require_permission("staff:write", "staff:read")
    ),
):
    try:
        logger.info(f"Router: Fetching positions")
    
        positions: list[dict] = (
            PositionServices.fetch_school_positions(db, school_id)
        )
    
        return positions
    
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching positions - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching positions - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed fetching positions: {str(e)}"
        )