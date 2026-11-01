from typing import Any
import uuid
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from modules.staff.schemas.requests.staff import CreateStaffRequest
from shared.data.models import (
    Campus,
    Department,
    Position,
    Staff,
    StaffCampus,
    StaffDepartment,
    StaffPosition,
    User,
)
from shared.data.repositories.repository import BaseRepository
from shared.data.repositories.school_repository import SchoolRepository
from shared.data.schemas.domain import StaffCampusDomain, StaffDomain
from shared.data.schemas.exceptions import RecordNotFoundException


class StaffRepository(BaseRepository[Staff, StaffDomain]):

    model = Staff

    def create_staff(self, db: Session, data: StaffDomain) -> StaffDomain:

        staff = Staff(**data.model_dump(exclude_unset=True))

        db.add(staff)
        db.flush()
        db.refresh(staff)

        return staff.to_pydantic()

    def create_staff_campus(
        self,
        db: Session,
        staff_id: uuid.UUID,
        campus_id: uuid.UUID,
        created_by_id: uuid.UUID,
    ) -> StaffCampusDomain:
        staff_campus = StaffCampus(
            staff_id=staff_id,
            campus_id=campus_id,
            created_by_id=created_by_id,
            updated_by_id=created_by_id,
        )

        db.add(staff_campus)
        db.flush()
        db.refresh(staff_campus)

        return staff_campus.to_pydantic()

    def get_user_staffs(db: Session, user_id: uuid.UUID) -> list[StaffDomain]:

        staffs = db.query(Staff).filter(Staff.user_id == user_id)

        return [staff.to_pydantic() for staff in staffs]

    def paginated_filter(
        self,
        db: Session,
        school_id: uuid.UUID,
        page: int = 1,
        limit: int = 20,
        filters: list = [],
        search: str = "",
        sortBy: str = "",
        sortOrder: str = "asc",
    ) -> dict:

        offset = (page - 1) * limit

        staff_query = select(Staff)

        paginated_staff_ids = (
            staff_query.order_by(Staff.id).offset(offset).limit(limit).subquery()
        )

        if search:
            staff_query = staff_query.where(
                or_(
                    User.first_name.ilike(f"%{search}%"), 
                    User.last_name.ilike(f"%{search}%"),
                    Staff.staff_no == search
                )
            )

        for filt in filters:
            id = filt.get("id")
            values = filt.get("value")
            if id == "department":
                staff_query = staff_query.where(
                    Department.id.in_(values)
                )

            if id == "location":
                staff_query = staff_query.where(
                    Campus.id.in_(values)
                )

        # if sortOrder == "desc":
        #     staff_query = staff_query.order_by(Staff.staff_no.desc)
        # else:
        #     staff_query = staff_query.order_by(Staff.staff_no)

        statement = (
            staff_query
            # .join(paginated_staff_ids, paginated_staff_ids.c.id == Staff.id)
            .join(User, User.id == Staff.user_id)
            .outerjoin(StaffDepartment, StaffDepartment.staff_id == Staff.id)
            .outerjoin(Department, Department.id == StaffDepartment.department_id)
            .outerjoin(StaffCampus, StaffCampus.staff_id == Staff.id)
            .outerjoin(Campus, Campus.id == StaffCampus.campus_id)
            .outerjoin(StaffPosition, StaffPosition.staff_id == Staff.id)
            .outerjoin(Position, Position.id == StaffPosition.position_id)
            .filter(Staff.school_id == school_id)
            .order_by(Staff.staff_no)
        )

        staff = db.scalars(statement).all()

        count = select(func.count()).select_from(Staff)
        total = db.scalar(count) or 0

        return {
            "items": [stf.to_pydantic() for stf in staff],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }
