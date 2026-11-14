import uuid

from sqlalchemy import and_, func, or_, select

from shared.data.models import Campus, Classroom, Enrollment, Media, SchoolClass, Student
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StudentDomain
from sqlalchemy.orm import Session


class StudentRepository(BaseRepository[Student, StudentDomain]):

    model = Student

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

        students_query = select(
            Student
        )

        # paginated_students_ids = (
        #     staff_query.order_by(Staff.id).offset(offset).limit(limit).subquery()
        # )

        if search:
            students_query = students_query.where(
                or_(
                    Student.first_name.ilike(f"%{search}%"),
                    Student.last_name.ilike(f"%{search}%"),
                    Student.middle_name.ilike(f"%{search}%"),
                    Student.admission_number == search,
                )
            )

        for filt in filters:
            id = filt.get("id")
            values = filt.get("value")
            if id == "classroom":
                students_query = students_query.where(SchoolClass.id.in_(values))

            if id == "campus":
                students_query = students_query.where(Campus.id.in_(values))

            if id == "gender":
                students_query = students_query.where(Student.gender.in_(values))
        # if sortOrder == "desc":
        #     staff_query = staff_query.order_by(Staff.staff_no.desc)
        # else:
        #     staff_query = staff_query.order_by(Staff.staff_no)

        statement = (
            students_query
            # .join(paginated_staff_ids, paginated_staff_ids.c.id == Staff.id)
            .outerjoin(Enrollment, Enrollment.student_id == Student.id)
            .outerjoin(Classroom, Classroom.id == Enrollment.classroom_id)
            .outerjoin(SchoolClass, Classroom.school_class_id == SchoolClass.id)
            .outerjoin(Campus, Campus.id == Student.campus_id)
            .join(Media, and_(Media.entity_id == Student.id, Media.media_type == 'profile'))
            .filter(Student.school_id == school_id)
            .order_by(Student.admission_date)
            .offset(offset)
            .limit(limit)
        )

        students = db.scalars(statement).all()

        count = select(func.count()).select_from(Student)
        total = db.scalar(count) or 0

        return {
            "items": [student.to_pydantic() for student in students],
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }
