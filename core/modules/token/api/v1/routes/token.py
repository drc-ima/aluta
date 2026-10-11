
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.token.schemas.requests import TokenRequest
from modules.token.schemas.responses import TokenResponse
from modules.user.services.user import UserServices
from shared.data.schemas.exceptions import RecordNotFoundException
from shared.data.session import get_db
from shared.utils.token import token


router = APIRouter()

@router.post(
    "/login",
    response_model=TokenResponse,
)
def normal_login(
    request: TokenRequest,
    db: Session = Depends(get_db)
):
    """
        Login users with username and password
    """
    try:
        logger.info(f"Router: Generating token...")

        user = UserServices().login_service(db, request)

        access_token = token(
            str(user.id), 
            type="access", 
            expires_delta=None,
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name,
            user_type=user.user_type,
            upn=user.username,
            roles=[{"id": str(role.id), "name": role.role.name} for role in user.user_roles],
            # permissions=user.permissions
        )

        refresh_token = token(
            str(user.id), 
            type="refresh", 
            expires_delta=None,
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name,
            user_type=user.user_type,
            upn=user.username,
            roles=[{"id": str(role.id), "name": role.role.name} for role in user.user_roles],
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error logging in- {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error logging in - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to login: {str(e)}"
        )