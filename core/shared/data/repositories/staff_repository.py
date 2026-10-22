

import uuid
from sqlalchemy.orm import Session

from modules.staff.schemas.requests.staff import CreateStaffRequest
from shared.data.models import Staff, StaffCampus
from shared.data.repositories.repository import BaseRepository
from shared.data.repositories.school_repository import SchoolRepository
from shared.data.schemas.domain import StaffCampusDomain, StaffDomain
from shared.data.schemas.exceptions import RecordNotFoundException


class StaffRepository(BaseRepository[Staff, StaffDomain]):

    model = StaffDomain

    def create_staff(self, db: Session, data: StaffDomain) -> StaffDomain:

        staff = Staff(
            **data.model_dump(exclude_unset=True)
        )

        db.add(staff)
        db.flush()
        db.refresh(staff)

        return staff.to_pydantic()

    def create_staff_campus(self, db: Session, staff_id: uuid.UUID, campus_id: uuid.UUID, created_by_id: uuid.UUID) -> StaffCampusDomain:
        staff_campus = StaffCampus(
            staff_id=staff_id,
            campus_id=campus_id,
            created_by_id=created_by_id,
            updated_by_id=created_by_id
        )

        db.add(staff_campus)
        db.flush()
        db.refresh(staff_campus)

        return staff_campus.to_pydantic()
    
    def get_user_staffs(db: Session, user_id: uuid.UUID) -> list[StaffDomain]:

        staffs = (
            db.query(Staff).filter(Staff.user_id == user_id)
        )

        return [staff.to_pydantic() for staff in staffs]