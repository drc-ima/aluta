
from datetime import datetime, timezone
from typing import Any
import uuid

from handlers.exceptions import exception_catcher
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.student.schemas.requests.student import CreateStudentRequest
from shared.data.repositories.student_repository import StudentRepository
from shared.data.repositories.department_repository import DepartmentRepository
from shared.data.schemas.domain import studentDomain
from shared.data.schemas.exceptions import RecordNotFoundException

class StudentServices:

    @exception_catcher
    def get_campus_students(db: Session, campus_id: uuid.UUID) -> list[dict[str, Any]]:

        students = StudentRepository.filter(db, campus_id=campus_id)

        return [student.model_dump(mode="json") for student in students]

    @exception_catcher
    def create_school_student(db: Session, request: CreateStudentRequest, school_id: uuid.UUID) -> studentDomain:

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
                
                data = studentDomain(
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

                studentRepository.create(db, data)

                return None
        except Exception as e:
            logger.error(f"Service: Error creating student: {e}")
            db.rollback()
            raise
        finally:
            db.close()