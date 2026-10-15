from datetime import datetime, timezone
import uuid

from sqlalchemy.orm import Session

from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.school.schemas.requests.department import CreateSchoolDepartmentRequest
from shared.data.repositories.department_repository import DepartmentRepository
from shared.data.schemas.domain import DepartmentDomain

class DepartmentServices:

    @exception_catcher
    def get_school_departments(db: Session, school_id: uuid.UUID) -> list[DepartmentDomain]:

        departments: list[DepartmentDomain] = DepartmentRepository.filter(db, school_id=school_id)

        return [department.model_dump(mode="json") for department in departments]

    @exception_catcher
    def add_school_department(db: Session, request: CreateSchoolDepartmentRequest, school_id: uuid.UUID, user: dict) -> DepartmentDomain:
        try:
            with db.begin():
                data = DepartmentDomain(
                    school_id=school_id,
                    name=request.name,
                    description=request.description,
                    created_by_id=user.get("id"),
                    updated_by_id=user.get("id"),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                    
                )
                department = DepartmentRepository.create(db, data)

                return department
        except Exception as e:
            logger.error(f"Service: Error creatomg academic period: {e}")
            db.rollback()
            raise
        finally:
            db.close()