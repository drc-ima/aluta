import uuid

from sqlalchemy import and_

from modules.user.schemas.requests.admin import CreateAdminRequest
from sqlalchemy.orm import Session, joinedload, contains_eager, selectinload

from modules.user.schemas.requests.user import CreateUserRequest
from shared.data.models import Permission, Role, User, UserPermission, UserRole
from shared.data.schemas.domain import UserDomain
from shared.data.schemas.exceptions import RecordNotFoundException


class UserRepository:

    def create_admin(self, db: Session, admin_data: CreateAdminRequest) -> UserDomain:
        user = User(
            first_name=admin_data.first_name,
            last_name=admin_data.last_name,
            user_type="ADMINISTRATOR",
            email=admin_data.email,
            username=admin_data.email,
            is_active=True,
        )

        user.set_password(admin_data.password)

        db.add(user)

        db.flush()
        db.refresh(user)
        # created_user = db.query(User).filter(User.username==user.username).all()

        user_role = UserRole(user_id=user.id, role_id=admin_data.role_id)

        db.add(user_role)

        db.flush()
        db.refresh(user)
        return user.to_pydantic()

    def get_by_username(self, db: Session, username: str) -> UserDomain | None:

        user = (
            db.query(User)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
            .filter(User.username == username)
            .one_or_none()
        )

        return user.to_pydantic() if user else None

    def create_user(self, db: Session, data: UserDomain) -> UserDomain:

        # username = data.email if data.username_field == "Email" else data.phone
        
        user = User(
            **data.model_dump(exclude_unset=True),
            # first_name=data.first_name,
            # middle_name=data.middle_name,
            # last_name=data.last_name,
            # user_type=data.user_type,
            # email=data.email,
            # phone=data.phone,
            # username=username,
            # is_active=False,
        )

        user.set_password(data.password)

        db.add(user)

        db.flush()
        db.refresh(user)

        # if data.role_id:
        #     user_role = UserRole(user_id=user.id, role_id=data.role_id)
        #     db.add(user_role)
        
        db.flush()
        db.refresh(user)
        return user.to_pydantic()

    def activate_user(self, db: Session, user_id: uuid.UUID) -> UserDomain:

        user = db.query(User).get(user_id)

        if not user:
            raise RecordNotFoundException("User", user_id)

        user.verified = True
        user.is_active = True

        db.commit()
        db.flush()
        db.refresh(user)

        return user.to_pydantic()

    def deactivate_user(self, db: Session, user_id: uuid.UUID) -> UserDomain:

        user = db.query(User).get(user_id)

        if not user:
            raise RecordNotFoundException("User", user_id)

        user.is_active = False

        db.commit()
        db.flush()
        db.refresh(user)

        return user.to_pydantic()