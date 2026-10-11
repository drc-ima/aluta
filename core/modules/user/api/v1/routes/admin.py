
from fastapi import APIRouter, HTTPException, status, Depends
from middlewares.logging.logger import logger
from modules.user.schemas.requests.admin import CreateAdminRequest
from modules.user.schemas.responses.admin import NewAdminResponse
from sqlalchemy.orm import Session

from modules.user.services.admin import AdminServices
from shared.data.schemas.exceptions import RecordAlreadyExistsException
from shared.data.session import get_db

router = APIRouter()

@router.post(
    "/admin",
    response_model=NewAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin(
    request: CreateAdminRequest,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Router: Creating admin user with email '{request.email}'")

        AdminServices().create_admin_service(
            db=db,
            request=request
        )

        return NewAdminResponse(message="New admin user created")
    except RecordAlreadyExistsException as e:
        logger.error(f"Router: User already exists - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error creating user - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error creating user - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to create user: {str(e)}"
        )