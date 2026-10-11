
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from middlewares.logging.logger import logger
from modules.user.schemas.requests.user import VerifyUserRequest, VerifyUserResponse
from modules.user.services.user import UserServices
from shared.contents.emails import EMAIL_BODIES
from shared.data.schemas.domain.email import EmailMessageSchema
from shared.data.schemas.exceptions import RecordNotFoundException
from shared.data.session import get_db
from shared.services.email import email_sender


router = APIRouter()

@router.post(
    "/verify",
    response_model=VerifyUserResponse,
    status_code=200
)
async def verify_user(
    request: VerifyUserRequest,
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

        await email_sender.send(data=email)
        return VerifyUserResponse(message="User has been verified")
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