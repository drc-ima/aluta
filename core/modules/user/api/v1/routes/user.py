
import traceback
import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.school.services.school import SchoolServices
from modules.user.schemas.requests.user import UserDefaultRequest, UserDefaultsRequest, VerifyTokenResponse, VerifyTokenRequest
from modules.user.services.user import UserServices
from shared.contents.emails import EMAIL_BODIES
from shared.data.schemas.domain import SchoolDomain
from shared.data.schemas.domain.email import EmailMessageSchema
from shared.data.schemas.exceptions import RecordNotFoundException
from shared.data.session import get_db, get_user
from shared.services.email import email_sender


router = APIRouter()

@router.post(
    "/verify",
    response_model=VerifyTokenResponse,
    status_code=200
)
def verify_user(
    request: VerifyTokenRequest,
    db: Session = Depends(get_db)
):
    try:
        user = UserServices().verify_user(db, request=request)

        email_message = EMAIL_BODIES.get("verified", {}).get("user")

        email_body = email_sender.body_context(email_message)

        email = EmailMessageSchema(
            to=[user.email,],
            subject="Welcome to Aluta",
            body=email_body,
            html_body=email_body
        )

        email_sender.send(data=email)
        return VerifyTokenResponse(message="User has been verified")
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error verifying user - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error verifying user - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  verifying user: {str(e)}"
        )

@router.get(
    "/schools",
    status_code=200
    # response_model=JSONResponse
)
def user_schools(
    user: dict | None = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = uuid.UUID(user.get("id"))
        schools: list[SchoolDomain] = SchoolServices().user_active_schools(db, user_id)

        return [school.model_dump(mode="json") for school in schools]
            
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching user school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching user school - {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Failed  fetching user school: {str(e)}"
        )


@router.get(
    "/schools-campuses",
    status_code=200
)
def user_schools_campuses(
    user: dict | None = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = uuid.UUID(user.get("id"))
        schools: list[SchoolDomain] = SchoolServices().user_schools_campuses(db, user_id)

        return schools
            
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching user school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching user school - {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Failed  fetching user school: {str(e)}"
        )



@router.get(
    "/defaults",
    status_code=200
)
def user_defaults(
    user: dict | None = Depends(get_user),
    db: Session = Depends(get_db)
):
    try:
        user_id = user.get("id")

        defaults = UserServices.user_defaults(db, user_id)

        formatted: dict | None = {}
        for default in defaults:
            formatted[default.module.name] = default.entity_id

        if len(formatted.keys()) > 0:
            return formatted
        return None
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching user school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching user school - {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Failed  fetching user school: {str(e)}"
        )


@router.post(
    "/defaults",
    status_code=200
)
def update_user_defaults(
    request: UserDefaultsRequest,
    user: dict | None = Depends(get_user),
    db: Session = Depends(get_db)
):

    try:
        user_id = user.get("id")

        news = UserServices.update_defaults(db, request=request, user_id=user_id)

        formatted: dict | None = {}
        for default in news:
            formatted[default.module.name] = default.entity_id

        return formatted
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error fetching user school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error fetching user school - {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, detail=f"Failed  fetching user school: {str(e)}"
        )
    