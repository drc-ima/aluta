

from datetime import datetime, timezone
import os
from urllib.parse import urlencode
import uuid

from fastapi import HTTPException, status

from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.token.schemas.requests import TokenRequest
from modules.user.schemas.requests.user import CreateUserRequest, ForgotPasswordRequest, UserDefaultsRequest, VerifyTokenRequest
from modules.user.services.role import RoleServices
from shared.contents.emails import EMAIL_BODIES
from shared.services.email import email_sender
from shared.data.models import User
from shared.data.repositories.module_repository import ModuleRepository
from shared.data.repositories.user_default_repository import UserDefaultRepository
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import UserDefaultModuleDomain, UserDomain, UserInputDomain
from shared.data.schemas.domain.email import EmailMessageSchema
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException
from sqlalchemy.orm import Session

from shared.utils.password import verify_password
from shared.utils.token import TokenTypes, decode_token, token


class UserServices:

    @exception_catcher
    def login_service(self, db: Session, request: TokenRequest) -> UserDomain | None:
        try:
            with db.begin():
                user: UserInputDomain | None = UserRepository().get_by_username(db, request.username)
    
                if user is None:
                    raise RecordNotFoundException("User", request.username)

                user_password_hash = UserRepository().get_user_password_hash(db, user.username)

                if not user_password_hash:
                    raise HTTPException(status_code=400, detail="User does not have password set. Click on reset password to create a password.")
                
                # verify password
                if not verify_password(request.password, user_password_hash):
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

                    # check if module has a default entity
                    existing_default = UserDefaultRepository.get(db, user_id=user_id, entity_id=entity_id, module_id=module.id)

                    # already exists, skip
                    if existing_default:
                        continue

                    existing_module = UserDefaultRepository.get(db, user_id=user_id, module_id=module.id)

                    if existing_module:
                        updated = UserDefaultRepository.update(
                            db,
                            data={
                                "entity_id": entity_id,
                                "updated_by_id": user_id, 
                                "updated_at": datetime.now(timezone.utc)
                            },
                            filters={
                                "user_id": user_id, 
                                "module_id": module.id, 
                            }
                        )
                        continue

                    # create new user default module
                    new_data = UserDefaultModuleDomain(
                        user_id=user_id,
                        entity_id=entity_id,
                        module_id=module.id,
                        created_by_id=user_id,
                        updated_by_id=user_id,
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

    def forgot_password(db: Session, request: ForgotPasswordRequest):

        try:
            with db.begin():
                # check if user with this email exists
                user = UserRepository.get(db, username=request.username)

                if not user:
                    raise RecordNotFoundException("User", request.username)

                # if the user is unverified and inactive, send verification link
                if user.verified and not user.is_active:
                    raise HTTPException(status_code=400, detail="User with this email has been deactivated. Please contact your admin to activate your account.")

                set_password_token = token(
                    user.id,
                    TokenTypes.set_password,
                    uuid.uuid4(),
                    expires_delta="1d",
                    upn=user.email,
                    kind="staff",
                    intent="set-password" if user.verified else "create-password"
                )

                frontend_url = os.getenv("FRONTEND_URL").rstrip("/")
                def build_url(token: str) -> str:
                    query = urlencode({"token": token})
                    return f"{frontend_url}/set-password?{query}"

                email_body = EMAIL_BODIES.get("set-password", {})

                full_name = user.full_name
                set_password_link = build_url(set_password_token)

                email_text = email_sender.body_context(email_body.get("text"), full_name=full_name, set_password_link=set_password_link)
                email_html = email_sender.body_context(email_body.get("html"), full_name=full_name, set_password_link=set_password_link)

                email_message = EmailMessageSchema(
                    to=[user.email,],
                    subject="Password Reset @ Aluta",
                    body=email_text,
                    html_body=email_html
                )

                email_sender.send(data=email_message)
        except Exception as e:
            logger.error(f"Service: Error with forgot password: {e}")
            db.rollback()
            raise
        finally:
            db.close()