

from datetime import datetime, timezone
import uuid
from fastapi import status
from fastapi.exceptions import HTTPException
from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.school.schemas.requests.academic_period import CreateCampusAcademicPeriodRequest
from shared.data.repositories.academic_period_repository import AcademicPeriodRepository
from shared.data.schemas.domain import AcademicPeriodDomain
from sqlalchemy.orm import Session

from shared.utils.dates import is_range_inside

class AcademicPeriodServices:

    @exception_catcher
    def add_academic_periods(db: Session, campus_id: uuid.UUID, school_id: uuid.UUID, request: CreateCampusAcademicPeriodRequest, user: dict) -> list[AcademicPeriodDomain]:
        try:
            with db.begin():

                # check dates conflicts
                if request.start_date >= request.end_date:
                    raise HTTPException(
                        detail="Please select valid date range",
                        status_code=status.HTTP_409_CONFLICT
                    )
                
                # if has parent id, check if the dates are in the the parents dates
                if request.parent_id:
                    parent: AcademicPeriodDomain | None = AcademicPeriodRepository.get(db, campus_id=campus_id, parent_id=request.parent_id)
                    if parent:
                        if is_range_inside(inner_start=request.start_date, outer_start=parent.start_date, inner_end=request.end_date, outer_end=parent.end_date):
                            raise HTTPException(
                                detail="Please ensure dates are in between the dates of the academic year",
                                status_code=status.HTTP_409_CONFLICT
                            )

                data = AcademicPeriodDomain(
                    name=request.name,
                    campus_id=campus_id,
                    school_id=school_id,
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