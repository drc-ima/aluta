

from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session
from handlers.exceptions import exception_catcher
from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.staff.schemas.requests.position import CreatePositionRequest
from shared.data.repositories.position_repository import PositionRepository
from shared.data.schemas.domain import PositionDomain


class PositionServices:

    @exception_catcher
    def add_school_position(db: Session, request: CreatePositionRequest, school_id: uuid.UUID) -> list[dict]:
        try:
            with db.begin():
                created_by_id = get_user_id_email().get("id")
                data = PositionDomain(
                    school_id=school_id,
                    name=request.name,
                    description=request.description,
                    employment_type=request.employment_type,
                    rank=request.rank,
                    default=False,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )

                PositionRepository.create(db, data)

                positions = PositionRepository.filter(db, school_id=school_id)
                
                return [position.model_dump(mode="json") for position in positions]
        except Exception as e:
            logger.error(f"Service: Error creatomg academic period: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    @exception_catcher
    def fetch_school_positions(db: Session, school_id: uuid.UUID) -> list[dict]:

        positions = PositionRepository.filter(db, school_id=school_id)

        return [position.model_dump(mode="json") for position in positions]
