import uuid

from sqlalchemy import func, or_, select

from shared.data.models import Campus, Guardian, School, Student, StudentGuardian
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import GuardianDomain
from sqlalchemy.orm import Session

class GuardianRepository(BaseRepository[Guardian, GuardianDomain]):
    model = Guardian

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

        guardians_query = select(
            Guardian
        )

        if search:
            guardians_query = guardians_query.where(
                or_(
                    Guardian.first_name.ilike(f"%{search}%"),
                    Guardian.last_name.ilike(f"%{search}%"),
                )
            )

        for filt in filters:
            id = filt.get("id")
            values = filt.get("value")

            if id == "campus":
                guardians_query = guardians_query.where(Campus.id.in_(values))

            if id == "student":
                guardians_query = guardians_query.where(Student.id.in_(values))

        statement = (
            guardians_query
            .outerjoin(School, School.id == Guardian.school_id)
            .outerjoin(Campus, Campus.school_id == School.id)
            .outerjoin(StudentGuardian, StudentGuardian.guardian_id == Guardian.id)
            .outerjoin(Student, Student.id == StudentGuardian.student_id)
            .filter(Guardian.school_id == school_id)
            .order_by(Guardian.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        guardians = db.scalars(statement).all()
        count = select(func.count()).select_from(Guardian)
        total = db.scalar(count) or 0
        
        return {
            "items": [guardian.to_pydantic() for guardian in guardians],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }