import uuid

from sqlalchemy.orm import Session

from shared.data.models import Role
class RoleRepository:

    def get_by_id(self, db: Session, id: uuid.UUID) -> Role | None:
    
        role = db.query(Role).filter(Role.id == id).first()
    
        return role.to_pydantic() if role else None