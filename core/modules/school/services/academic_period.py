

from datetime import datetime, timezone
import uuid

from fastapi.exceptions import HTTPException
from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.school.schemas.requests.academic_period import CreateCampusAcademicPeriodRequest
from shared.data.repositories.academic_period_repository import AcademicPeriodRepository
from shared.data.schemas.domain import AcademicPeriodDomain
from sqlalchemy.orm import Session

class AcademicPeriodServices:

    @exception_catcher
    def add_academic_periods(db: Session, campus_id: uuid.UUID, request: CreateCampusAcademicPeriodRequest, user: dict) -> list[AcademicPeriodDomain]:
        try:
            with db.begin():

                data = AcademicPeriodDomain(
                    name=request.name,
                    campus_id=campus_id,
                    school_id=request.school_id,
                    parent_id=request.parent_id,
                    start_date=request.start_date,
                    end_date=request.end_date,
                    created_by_id=user.get("id"),
                    updated_by_id=user.get("id"),
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )

                academic_period = AcademicPeriodRepository.create(db, data)

                return academic_period
        except Exception as e:
            logger.error(f"Service: Error creatomg academic period: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    @exception_catcher
    def get_campus_nested_periods(db: Session, campus_id: uuid.UUID) -> list[AcademicPeriodDomain]:

        ap = AcademicPeriodRepository.filter_nested(db, campus_id=campus_id)

        return ap