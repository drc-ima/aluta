from typing import Any
import uuid

from handlers.exceptions import exception_catcher
from shared.data.repositories.guardian_repository import GuardianRepository
from sqlalchemy.orm import Session

class GuardianServices:

    @exception_catcher
    def get_school_guardians(db: Session, school_id: uuid.UUID, **params: Any) -> dict:
    
        guardians = GuardianRepository().paginated_filter(db, school_id=school_id, **params)
    
        return guardians