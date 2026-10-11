
from fastapi import HTTPException, status

from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.user.schemas.requests.admin import CreateAdminRequest
from modules.user.schemas.responses.admin import NewAdminResponse
from sqlalchemy.orm import Session
from modules.token.schemas.requests import TokenRequest
from modules.user.services.role import RoleServices
from shared.data.models import User
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import UserDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException


class AdminServices:

    def _verify_user_exists(self, db: Session, username: str):
        user = UserRepository.get_by_username(db, username=username)

        if user:
            raise RecordAlreadyExistsException("User", username)


    @exception_catcher
    def create_admin_service(
        self,
        db: Session,
        request: CreateAdminRequest,
    ) -> dict | None:

        try:

            with db.begin():
                #  verify if user with email already exist
                self._verify_user_exists(db, username=request.email)
                RoleServices().verify_role_exists(db, request.role_id)

                user = UserRepository().create_admin(
                    db,
                    admin_data=request
                )

                logger.info(f"Service: New admin user created successful.")

                return user.model_dump() if user else None
        except Exception as e:
            logger.error(f"Service: Error creating user: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    