

import uuid

from fastapi import HTTPException, status

from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.token.schemas.requests import TokenRequest
from modules.user.schemas.requests.user import CreateUserRequest, VerifyUserRequest
from modules.user.services.role import RoleServices
from shared.data.models import User
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import UserDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException
from sqlalchemy.orm import Session

from shared.utils.password import verify_password
from shared.utils.token import TokenTypes, decode_token


class UserServices:

    def login_service(self, db: Session, request: TokenRequest) -> UserDomain | None:
        try:
            with db.begin():
                user: UserDomain | None = UserRepository().get_by_username(db, request.username)
    
                if user is None:
                    raise RecordNotFoundException("User", request.username)
    
    
                # verify password
                if not verify_password(request.password, user.password):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User credentials did not match."
                    )
                if not user.is_active:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"User {request.username} is not active.")
                
                return user if user else None
        except Exception as e:
            logger.error(f"Service: Error logging in: {e}")
            db.rollback()
            raise
        finally:
            db.close()
    
    def _verify_user_exists(self, db: Session, username):
        user = UserRepository.get_by_username(db, username=username)
        
        if user:
            raise RecordAlreadyExistsException("User", username)

    def get_user_by_id(self, db: Session, id: uuid.UUID) -> UserDomain | None:
        user = (
            db.query(User)
            .filter(User.id == id)
            .first()
        )

        return user.to_pydantic() if user else None
    
    @exception_catcher
    def create_user_service(
        self,
        db: Session,
        data: CreateUserRequest
    ) -> UserDomain:

        try:
            #  verify if user with email already exist
            self._verify_user_exists(db, username=data.email)
            RoleServices().verify_role_exists(db, data.role_id)
            
            user = UserRepository().create_user(
                db,
                data=data
            )

            logger.info(f"Service: New user created successful.")
            
            return user if user else None
        except Exception as e:
            logger.error(f"Service: Error creating user: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def verify_user(self, db: Session, request: VerifyUserRequest) -> UserDomain | None:
        try:
            # decode token
            decoded = decode_token(request.token, TokenTypes.verify)

            # get user from payload
            user_id = uuid.UUID(decoded.get("sub"))
            user = UserRepository().activate_user(db, user_id=user_id)

            return user if user else None
        except Exception as e:
            logger.error(f"Service: Error creating user: {e}")
            db.rollback()
            raise
        finally:
            db.close()
