import uuid

from fastapi import HTTPException

from handlers.exceptions import exception_catcher
from middlewares.context.request import get_auth_token
from middlewares.logging.logger import logger
from shared.data.repositories.token_repository import TokenRepository
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import TokenDomain, UserDomain
from sqlalchemy.orm import Session

from shared.utils.token import TokenTypes, decode_token, token

class TokenServices:

    @exception_catcher
    def login_access_token(db: Session, user: UserDomain) -> TokenDomain:
        try:
            with db.begin():

                # if user already has a generated access token, fetch it and check if it is still valid
                already_token = TokenRepository.get(db, user_id=user.id, revoked=False)

                if already_token:
                    decoded = decode_token(already_token.token, TokenTypes.access)
                    if decoded:
                        return already_token
                    else:
                        # token has expired so revoke it
                        TokenRepository.update(db, {"revoked": True}, filters={"id": already_token.id})
                    
                jwt_id = uuid.uuid4()
                access_token = token(
                    user.id,
                    TokenTypes.access,
                    jwt_id,
                    expires_delta="5m",
                    first_name=user.first_name,
                    last_name=user.last_name,
                    middle_name=user.middle_name,
                    user_type=user.user_type,
                    upn=user.username,
                    roles=[
                        {
                            "id": str(role.id),
                            "name": role.role.name,
                            "school_id": str(role.role.school_id) if role.role.school_id else None,
                            "permissions": [
                                perm.permission.code_name for perm in role.role.role_permissions
                            ],
                        }
                        for role in user.user_roles
                    ],
                    permissions=[perm.permission.code_name for perm in user.user_permissions],
                )

                token_data = TokenDomain(
                    id=jwt_id,
                    user_id=user.id,
                    token=access_token,
                    token_type="Bearer",
                    revoked=False
                )

                created = TokenRepository.create(db, token_data)

                return created
        except Exception as e:
            logger.error(f"Service: Error generating token: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    @exception_catcher
    def refresh_access_token(db: Session, refresh_token: str) -> TokenDomain:
        try:
            with db.begin():
                decoded_refresh_token = decode_token(refresh_token, TokenTypes.refresh)

                if not decoded_refresh_token:
                    # revoke their access token
                    TokenRepository.update(db, filters={"user_id": decoded_refresh_token.get("sub")}, data={"revoked": True})
                    raise HTTPException(status_code=401, detail="Session expired")

                user = UserRepository.get(db, id=decoded_refresh_token.get("sub"), is_active=True)

                if not user:
                    raise HTTPException(status_code=400, detail=f"User with this name {decoded_refresh_token.get("upn")} not found.")
                
                # check for access token
                already_access_token = TokenRepository.get(db, user_id=user.id)

                if already_access_token and already_access_token.revoked == False:
                    return already_access_token

                jwt_id = uuid.uuid4()
                access_token = token(
                    user.id,
                    TokenTypes.access,
                    jwt_id,
                    expires_delta="5m",
                    first_name=user.first_name,
                    last_name=user.last_name,
                    middle_name=user.middle_name,
                    user_type=user.user_type,
                    upn=user.username,
                    roles=[
                        {
                            "id": str(role.id),
                            "name": role.role.name,
                            "school_id": str(role.role.school_id) if role.role.school_id else None,
                            "permissions": [
                                perm.permission.code_name for perm in role.role.role_permissions
                            ],
                        }
                        for role in user.user_roles
                    ],
                    permissions=[perm.permission.code_name for perm in user.user_permissions],
                )

                token_data = TokenDomain(
                    id=jwt_id,
                    user_id=user.id,
                    token=access_token,
                    token_type="Bearer",
                    revoked=False
                )

                active_access_tokens = TokenRepository.filter(db, user_id=user.id, revoked=False)

                if len(active_access_tokens) > 1:
                    # if more that one remove more of them
                    TokenRepository.delete(db, user_id=user.id, revoked=False)
                else:
                    return active_access_tokens[0]

                created = TokenRepository.create(
                    db,
                    data=token_data,
                )

                return created
        except Exception as e:
            logger.error(f"Service: Error refreshing token: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    @exception_catcher
    def revoke_token(db: Session):
        try:
            with db.begin():
                token = get_auth_token()
                get_token = TokenRepository.get(db, token=token)

                if not get_token:
                    return None

                TokenRepository.update(db, filters={"id": get_token.id}, data={"revoked": True})

                return None
        except Exception as e:
            logger.error(f"Service: Error refreshing token: {e}")
            db.rollback()
            raise
        finally:
            db.close()
        