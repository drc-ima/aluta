

from datetime import datetime, timezone
import uuid

from fastapi import HTTPException, status

from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.token.schemas.requests import TokenRequest
from modules.user.schemas.requests.user import CreateUserRequest, UserDefaultRequest, UserDefaultsRequest, VerifyTokenRequest
from modules.user.services.role import RoleServices
from shared.data.models import User, UserDefaultModule
from shared.data.repositories.module_repository import ModuleRepository
from shared.data.repositories.user_default_repository import UserDefaultRepository
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import UserDefaultModuleDomain, UserDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException
from sqlalchemy.orm import Session

from shared.utils.password import verify_password
from shared.utils.token import TokenTypes, decode_token


class UserServices:

    @exception_catcher
    def login_service(self, db: Session, request: TokenRequest) -> UserDomain | None:
        try:
            with db.begin():
                user: UserDomain | None = UserRepository().get_by_username(db, request.username)
    
                if user is None:
                    raise RecordNotFoundException("User", request.username)
    
                # verify password
                if not verify_password(request.password, user.password):
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="User credentials did not match."
                    )

                if not user.verified:
                    raise HTTPException(status_code=status.HTTP_424_FAILED_DEPENDENCY, detail=f"User {request.username} is not verified.")
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

    def verify_user(self, db: Session, request: VerifyTokenRequest) -> UserDomain | None:
        try:
            # decode token
            decoded = decode_token(request.token, TokenTypes.verify)

            # get user from payload
            user_id = uuid.UUID(decoded.get("sub"))
            user = UserRepository().activate_user(db, user_id=user_id)

            return user if user else None
        except Exception as e:
            logger.error(f"Service: Error verifying user: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def user_defaults(db: Session, user_id: uuid.UUID) -> UserDefaultModuleDomain:
        try:
            defaults = UserDefaultRepository.filter(db, user_id=user_id)

            return defaults
        except Exception as e:
            logger.error(f"Service: Error fetching user defaults: {e}")

    def update_defaults(db: Session, request: UserDefaultsRequest, user_id: uuid.UUID) -> list[UserDefaultModuleDomain]:

        try:
            with db.begin():

                # fetch current user defaults
                existing_defaults = UserDefaultRepository.filter(db, user_id=user_id)

                existing_defaults_entity_ids = [ed.entity_id for ed in existing_defaults]
                
                news = []
                for default in request.defaults:
                    entity_id = default.entity_id
                    module_name = default.module_name

                    # check if the module name exists
                    module = ModuleRepository.get(db, name=module_name)

                    if not module:
                        continue
                
                    # check if the entity id exists
                    if entity_id in existing_defaults_entity_ids:
                        continue

                    # create new user default module
                    new_data = UserDefaultModuleDomain(
                        user_id=user_id,
                        entity_id=entity_id,
                        module_id=module.id,
                        created_by_id=user_id,
                        updated_by_id=user_id,
                        updated_at=datetime.now(timezone.utc)
                    )

                    news.append(new_data)
                
                UserDefaultRepository.bulk_create(db, data=news)

                # refetch defaults
                existing_defaults = UserDefaultRepository.filter(db, user_id=user_id)

                return existing_defaults 
                    
        except Exception as e:
            logger.error(f"Service: Error setting defaults: {e}")
            db.rollback()
            raise
        finally:
            db.close()