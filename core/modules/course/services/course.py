
from datetime import datetime, timezone
from typing import Any
import uuid

from handlers.exceptions import exception_catcher
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.course.schemas.requests.course import CreateCourseRequest
from shared.data.repositories.course_repository import CourseRepository
from shared.data.repositories.department_repository import DepartmentRepository
from shared.data.schemas.domain import CourseDomain
from shared.data.schemas.exceptions import RecordNotFoundException

class CourseServices:

    @exception_catcher
    def get_school_courses(db: Session, school_id: uuid.UUID) -> list[dict[str, Any]]:

        courses = CourseRepository.filter(db, school_id=school_id)

        return [course.model_dump(mode="json") for course in courses]

    @exception_catcher
    def create_school_course(db: Session, request: CreateCourseRequest, school_id: uuid.UUID) -> CourseDomain:

        try:
            with db.begin():
                created_by_id = get_user_id_email().get("id")
                created_at = datetime.now(timezone.utc)

                # check if department exist
                department = None
                if request.department_id:
                    department = DepartmentRepository.get(db, id=request.department_id)

                    if not department:
                        raise RecordNotFoundException("Department", request.department_id)
                
                data = CourseDomain(
                    school_id=school_id,
                    name=request.name,
                    code=request.code,
                    description=request.description,
                    department_id=request.department_id,
                    is_active=True,
                    created_at=created_at,
                    created_by_id=created_by_id,
                    updated_at=created_at,
                    updated_by_id=created_by_id
                )

                CourseRepository.create(db, data)

                return None
        except Exception as e:
            logger.error(f"Service: Error creating course: {e}")
            db.rollback()
            raise
        finally:
            db.close()