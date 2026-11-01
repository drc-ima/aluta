

from datetime import datetime, timezone
from typing import Any
import uuid

from handlers.exceptions import exception_catcher
from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.school_class.schemas.requests.school_class import CreateSchoolClassRequest
from shared.data.models import SchoolClass
from shared.data.repositories.campus_repository import CampusRepository
from shared.data.repositories.school_class_repository import SchoolClassRepository
from shared.data.schemas.domain import SchoolClassDomain
from sqlalchemy.orm import Session

from shared.data.schemas.exceptions import RecordNotFoundException


class SchoolClassServices:
    @exception_catcher
    def get_campus_classes(db: Session, campus_id: uuid.UUID) -> list[dict[str, Any]]:

        classes = db.query(SchoolClass).filter(SchoolClass.campus_id==campus_id).order_by(SchoolClass.code.asc())

        return [klass.to_pydantic().model_dump(mode="json") for klass in classes]
     
    @exception_catcher
    def create_range_class(db: Session, campus_id: uuid.UUID, request: CreateSchoolClassRequest) -> list[SchoolClassDomain]:

        try:
            with db.begin():
                created_by_id = get_user_id_email().get("id")
                created_at = datetime.now(timezone.utc)
                campus = CampusRepository.get(db, id=campus_id)

                if not campus:
                    raise RecordNotFoundException("Campus", campus_id)
                
                classes = [
                    SchoolClassDomain(
                        school_id=campus.school_id,
                        level=str(level),
                        capacity=request.capacity,
                        section=section.name,
                        campus_id=campus.id,
                        name=f"{request.prefix} {level}",
                        code=f"{request.prefix.lower()}-{level}-{section.name.lower()}",
                        active=True,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id,
                        created_at=created_at,
                        updated_at=created_at
                    ) for section in request.sections
                    for level in range(request.start, request.end + 1)
                ] if len(request.sections) else [
                    SchoolClassDomain(
                        school_id=campus.school_id,
                        level=str(level),
                        capacity=request.capacity,
                        section="N/A",
                        campus_id=campus.id,
                        name=f"{request.prefix} {level}",
                        code=f"{request.prefix.lower()}-{level}",
                        active=True,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id,
                        created_at=created_at,
                        updated_at=created_at
                    ) for level in range(request.start, request.end + 1)
                ]

                # check if class code already exists
                class_codes = [klass.code for klass in classes]
                already_created = [klass.to_pydantic().code for klass in db.query(SchoolClass).filter(SchoolClass.code.in_(class_codes))]

                # exclude already created

                only_new = [klass for klass in classes if klass.code not in already_created]

                created = SchoolClassRepository.bulk_create(db, only_new)

                return created

        except Exception as e:
            logger.error(f"Service: Error creating course: {e}")
            db.rollback()
            raise
        finally:
            db.close()