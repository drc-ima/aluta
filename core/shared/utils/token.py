
from datetime import datetime, timedelta, timezone
from enum import Enum
import os, re
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from shared.data.models import User
from shared.data.schemas.domain import UserDomain
from shared.data.session import get_db


class TokenTypes(str, Enum):
    access = "access"
    refresh = "refresh"
    verify = "verify"

@exception_catcher
def token(
    id: str,
    type: TokenTypes,
    expires_delta: str | None = None,
    
    **other_payload: dict
) -> str:

    try:
        now = datetime.now(timezone.utc)
        token_expires = os.getenv("ACCESS_TOKEN_EXPIRES") if type == "access" else os.getenv("REFRESH_TOKEN_EXPIRES") if type == "refresh" else expires_delta
        delta_type = token_expires[-1]
        if not delta_type in ["m", "d"]:
            raise Exception("token expires delta invalid")
        
        token_time = int(re.sub(r"[a-zA-Z]", "", token_expires))

        delta = timedelta(minutes=token_time) if delta_type == "m" else timedelta(days=token_time)
        expires_at = now + (
            delta
        )

        payload = {
            "sub": id,
            "iat": now,
            "exp": expires_at,
            "jwt": str(uuid.uuid4()),
            **other_payload
        }

        return jwt.encode(
            payload,
            os.getenv("SECRET_KEY") + type,
            algorithm=os.getenv("JWT_ALGORITHM")
        )
    except Exception as e:
        logger.error(f"Utils: Token creation error: {e}")
        raise e

def decode_token(token: str, type: TokenTypes) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY") + type,
            algorithms=[os.getenv("JWT_ALGORITHM")],
            options={"require": ["sub", "exp", "iat"]},
        )
        return payload
    except:
        return None
    # if payload.get("type") != type:
    #     raise jwt.InvalidTokenError("Invalid token type")

    

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/token"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> UserDomain:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTORIZED,
        detail="Cound not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = decode_token(token, "access")
        user_id = payload.get("sub")
    except (
        jwt.InvalidTokenError,
        KeyError,
        TypeError,
        ValueError
    ):
        raise credentials_exception

    user = db.get(User, user_id)

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User acount is not active"
        )

    return user