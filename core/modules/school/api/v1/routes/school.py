
import os
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException

from middlewares.logging.logger import logger
from modules.school.schemas.requests.school import RegisterSchoolRequest
from modules.school.schemas.responses import SchoolResponse
from modules.school.services.school import SchoolServices
from modules.user.schemas.requests.user import VerifyTokenRequest, VerifyTokenResponse
from modules.user.services.user import UserServices
from shared.data.schemas.domain.email import EmailMessageSchema
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException
from shared.data.session import get_db
from sqlalchemy.orm import Session

from shared.contents.emails import EMAIL_BODIES
from shared.services.email import email_sender
from shared.utils.token import TokenTypes, token


router = APIRouter()

@router.post(
    "/register",
    response_model=SchoolResponse
)
def register(
    request: RegisterSchoolRequest,
    db: Session = Depends(get_db)
):
    """
        Steps to register a new school ternant
    """

    try:
        logger.info(f"Router: Registering a school...")

        registration = SchoolServices().register_school_service(
            db,
            request=request
        )

        user = UserServices().get_user_by_id(db, registration.created_by_id)

        # TODO: As a registrar, I want to receive emails to verify the school's business email and my email address 
        # so that the school's tenant will be activated and my profile will also be activated

        # verify token
        school_verify_token = token(
            str(registration.id),
            TokenTypes.verify,
            expires_delta="3d",
            upn=registration.business_email,
            kind="school",
            school_id=str(registration.id)
        )

        creator_verify_token = token(
            str(registration.created_by_id),
            TokenTypes.verify,
            expires_delta="3d",
            upn=user.email,
            kind="staff",
            school_id=str(registration.id)
        )
        frontend_url = os.environ["FRONTEND_URL"].rstrip("/")
        def build_verification_url(token: str) -> str:
            query = urlencode({"token": token})
            return f"{frontend_url}/verify?{query}"

        school_message = EMAIL_BODIES.get("verification", {}).get("school", {})
        creator_message = EMAIL_BODIES.get("verification", {}).get("user", {})
        
        
        school_name = registration.name
        member_type = "Staff"
        full_name = user.full_name()

        # send school verification email
        school_email_text = email_sender.body_context(school_message.get("text"), verification_link=build_verification_url(token=school_verify_token), school_name=school_name)
        school_email_html = email_sender.body_context(school_message.get("html"), verification_link=build_verification_url(token=school_verify_token), school_name=school_name)
        email_message = EmailMessageSchema(
            to=[registration.business_email,],
            subject="Welcome to Aluta",
            body=school_email_text,
            html_body=school_email_html
        )
        email_sender.send(data=email_message)

        # send creator verification email
        creator_email_text = email_sender.body_context(creator_message.get("text"), verification_link=build_verification_url(token=creator_verify_token), member_type=member_type, full_name=full_name, school_name=school_name)
        creator_email_html = email_sender.body_context(creator_message.get("html"), verification_link=build_verification_url(token=creator_verify_token), member_type=member_type, full_name=full_name, school_name=school_name)
        email_message = EmailMessageSchema(
            to=[user.email,],
            subject="Welcome to Aluta from {school_name}".format(school_name=school_name),
            body=creator_email_text,
            html_body=creator_email_html
        )

        email_sender.send(data=email_message)

        return SchoolResponse(school_id=registration.id, message="New school registered. Next step is to verify business email and personal email to activate both.")
    except RecordAlreadyExistsException as e:
        logger.error(f"Router: User already exists - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error registering school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error registering school - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  registering school: {str(e)}"
        )


@router.post(
    "/verify",
    response_model=VerifyTokenResponse,
    status_code=200
)
def verify_school(
    request: VerifyTokenRequest,
    db: Session = Depends(get_db)
):
    try:
        school = SchoolServices.verify_school(db, data=request)

        email_message = EMAIL_BODIES.get("verified", {}).get("school")
        
        email_body = email_sender.body_context(email_message)
        
        email = EmailMessageSchema(
            to=[school.business_email,],
            subject="Welcome to Aluta",
            body=email_body,
            html_body=email_body
        )

        email_sender.send(data=email)
        return VerifyTokenResponse(message="School has been verified")
    except RecordNotFoundException as e:
        logger.error(f"Router: School not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error verifying school - {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error verifying school - {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed  verifying school: {str(e)}"
        )