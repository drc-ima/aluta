from datetime import datetime, timezone
import uuid

from sqlalchemy import insert
from sqlalchemy.orm import Session

from shared.data.models import Role, RolePermission, UserRole
from shared.data.schemas.domain import RoleDomain, RolePermissionDomain, UserRoleDomain
class RoleRepository:

    def get_by_id(self, db: Session, id: uuid.UUID) -> Role | None:
    
        role = db.query(Role).filter(Role.id == id).first()
    
        return role.to_pydantic() if role else None

    def create_school_role(self, db: Session, role_data: RoleDomain) -> RoleDomain:

        role = Role(
            **role_data.model_dump(exclude_unset=True)
        )

        db.add(role)
        db.flush()
        db.refresh(role)

        return role.to_pydantic()

    def create_role_permissions(self, db: Session, role_id: uuid.UUID, permissions: list[uuid.UUID]) -> list[RolePermissionDomain]:

        perm_objects = [
            RolePermissionDomain(
                role_id=role_id,
                permission_id=perm
            ).model_dump(exclude_unset=True) for perm in permissions
        ]

        perm_data = db.execute(
            insert(RolePermission).returning(RolePermission),
            perm_objects
        ).all()

        return [role_perm[0].to_pydantic() for role_perm in perm_data]

    def create_user_role(self, db: Session, user_id: uuid.UUID, role_id: uuid.UUID, created_by_id: uuid.UUID) -> UserRoleDomain:

        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            created_by_id=created_by_id,
            updated_by_id=created_by_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        db.add(user_role)

        db.flush()
        db.refresh(user_role)

        return user_role.to_pydantic()