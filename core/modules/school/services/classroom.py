from datetime import datetime, timezone
import uuid

from handlers.exceptions import exception_catcher
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.school.schemas.requests.classrooms import BulkCreateClassroomsRequest
from shared.data.repositories.academic_period_repository import AcademicPeriodRepository
from shared.data.repositories.classroom_repository import ClassroomRepository
from shared.data.schemas.domain import ClassroomDomain
from shared.data.schemas.exceptions import RecordNotFoundException


class ClassroomServices:
    @exception_catcher
    async def create_bulk_classrooms(db: Session, academic_period_id: uuid.UUID, request: BulkCreateClassroomsRequest):
        try:
            with db.begin():
                # check if academic period exists
                academic_period = AcademicPeriodRepository.get(db, id=academic_period_id)

                created_at = datetime.now(timezone.utc)
                created_by = get_user_id_email()
                if not academic_period:
                    raise RecordNotFoundException("AcademicPeriod", academic_period_id)

                data = [
                    ClassroomDomain(
                        school_class_id=classroom.school_class_id,
                        academic_period_id=academic_period_id,
                        created_by_id=created_by.get("id"),
                        updated_by_id=created_by.get("id"),
                        updated_at=created_at
                    ) for classroom in request.classrooms
                ]

                bulk_upsert = await ClassroomRepository().bulk_upsert(
                    db=db,
                    data=data,
                    conflict_fields=["school_class_id", "academic_period_id"],
                    update_fields=["updated_by_id", "updated_at"]
                )

                return bulk_upsert
        except Exception as e:
            logger.error(f"Service: Error creating classrooms: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def fetch_classrooms(db: Session, academic_period_id: uuid.UUID):
        try:
            classes = ClassroomRepository.filter(db, academic_period_id=academic_period_id)

            return [cls.model_dump(mode="json") for cls in classes]
        except Exception as e:
            logger.error(f"Service: Error fetching classrooms: {e}")
            db.rollback()
            raise
        finally:
            db.close()