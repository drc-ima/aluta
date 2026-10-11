
import uuid
from sqlalchemy.orm import Session
from shared.data.repositories.role_repository import RoleRepository
from shared.data.schemas.exceptions import RecordNotFoundException


class RoleServices:

    def verify_role_exists(self, db:Session, id: uuid.UUID):
        role = RoleRepository().get_by_id(db, id=id)

        if not role:
            raise RecordNotFoundException("Role", id)