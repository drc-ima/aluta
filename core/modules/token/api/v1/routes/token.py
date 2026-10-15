import json
import os
import traceback

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from middlewares.context.request import get_refresh_token
from middlewares.logging.logger import logger
from modules.token.schemas.requests import LoginRequest, TokenRequest
from modules.token.schemas.responses import TokenResponse
from modules.user.services.user import UserServices
from shared.data.schemas.exceptions import RecordNotFoundException
from shared.data.session import get_db, get_refreshtoken, get_user
from shared.utils.token import TokenTypes, decode_token, token

router = APIRouter()


@router.post("/login", response_class=JSONResponse, status_code=200)
def normal_login(request: TokenRequest, db: Session = Depends(get_db)):
    """
    Login users with username and password
    """
    try:
        logger.info(f"Router: Generating token...")

        user = UserServices().login_service(db, request)

        access_token = token(
            str(user.id),
            type=TokenTypes.access,
            expires_delta="10m",
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name,
            user_type=user.user_type,
            upn=user.username,
            roles=[
                {
                    "id": str(role.id),
                    "name": role.role.name,
                    "permissions": [
                        perm.permission.code_name for perm in role.role.role_permissions
                    ],
                }
                for role in user.user_roles
            ],
            permissions=[perm.permission.code_name for perm in user.user_permissions],
            staffs=[
                {
                    "id": str(staff.id),
                    "school_id": str(staff.school_id),
                    "campuses": [
                        str(campus.campus.id) for campus in staff.staff_campuses
                    ],
                }
                for staff in user.staffs
            ],
        )

        refresh_token = token(
            str(user.id),
            type=TokenTypes.refresh,
            expires_delta=None,
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name,
            user_type=user.user_type,
            upn=user.username,
            roles=[
                {
                    "id": str(role.id),
                    "name": role.role.name,
                    "permissions": [
                        perm.permission.code_name for perm in role.role.role_permissions
                    ],
                }
                for role in user.user_roles
            ],
            permissions=[perm.permission.code_name for perm in user.user_permissions],
            staffs=[
                {
                    "id": str(staff.id),
                    "school_id": str(staff.school_id),
                    "campuses": [
                        str(campus.campus.id) for campus in staff.staff_campuses
                    ],
                }
                for staff in user.staffs
            ],
        )

        content = {"access_token": access_token}

        response = JSONResponse(content=content)
        response.set_cookie(
            key="_aluta_sess",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 60 * 60 * 1000,  # 7d
            samesite="lax",
            secure=False if os.getenv("ENV") == "local" else True,
        )

        return response
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error logging in- {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error logging in - {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to login: {str(e)}")


@router.post("/refresh", response_class=Response, status_code=200)
def generate_access_token(db: Session = Depends(get_db), refresh_token: str = Depends(get_refreshtoken)):
    logger.info(f"Router: Signing user in...")
    try:

        payload = decode_token(refresh_token, "refresh")

        if not payload:
            raise HTTPException(status_code=401, detail="User is unauthenticated")

        user = UserServices().get_user_by_id(db, payload.get("sub"))

        if not user:
            raise HTTPException(status_code=400, detail=f"User with this name {payload.get("upn")} not found.")

        
        access_token = token(
            str(user.id),
            type=TokenTypes.access,
            expires_delta="10m",
            first_name=user.first_name,
            last_name=user.last_name,
            middle_name=user.middle_name,
            user_type=user.user_type,
            upn=user.username,
            roles=[
                {
                    "id": str(role.id),
                    "name": role.role.name,
                    "permissions": [
                        perm.permission.code_name for perm in role.role.role_permissions
                    ],
                }
                for role in user.user_roles
            ],
            permissions=[perm.permission.code_name for perm in user.user_permissions],
            staffs=[
                {
                    "id": str(staff.id),
                    "school_id": str(staff.school_id),
                    "campuses": [
                        str(campus.campus.id) for campus in staff.staff_campuses
                    ],
                }
                for staff in user.staffs
            ],
        )
        content = {"access_token": access_token}
        
        response = JSONResponse(content=content)
        return response
    except RecordNotFoundException as e:
        logger.error(f"Router: User not found - {e.detail}")
        raise e
    except HTTPException as e:
        logger.error(f"Router: HTTP error logging in- {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Router: Unexpected error logging in - {e}")
        raise HTTPException(status_code=500, detail=f"Failed to login: {str(e)}")
