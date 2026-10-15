

from typing import Any

from middlewares.context.request import get_user_id_email
from shared.data.models import AcademicPeriod
from shared.data.schemas.domain import AcademicPeriodDomain, build_tree
from sqlalchemy import insert
from sqlalchemy.orm import Session


class AcademicPeriodRepository:
    def create(db: Session, data:AcademicPeriodDomain) -> AcademicPeriodDomain:

        ap = AcademicPeriod(
            **data.model_dump(exclude_unset=True)
        )

        db.add(ap)

        db.flush()
        db.refresh(ap)

        return ap.to_pydantic()

    def bulk_create(db: Session, data: list[AcademicPeriodDomain]) -> list[AcademicPeriodDomain]:

        if not data:
            return []

        ap_objects = []

        for ap in data:
            ap.model_dump(exclude_unset=True)
            ap_objects.append(ap)

        ap_data = db.execute(
            insert(AcademicPeriod).returning(AcademicPeriod),
            ap_objects
        ).all()

        return [ap[0].to_pydantic() for ap in ap_data]

    def get(db: Session, **kwargs: Any) -> AcademicPeriodDomain | None:
        period = (
            db.query(AcademicPeriod)
            .filter_by(**kwargs)
            .first()
        )

        if period is None:
            return None

        return period.to_pydantic()

    def filter(db: Session, **kwargs) -> list[AcademicPeriodDomain]:

        periods = (
            db.query(AcademicPeriod)
            .filter_by(**kwargs)
            .all()
        )

        return [period.to_pydantic() for period in periods]


    def filter_nested(db: Session, **kwargs):
        

        periods = (
            db.query(AcademicPeriod)
            .filter_by(**kwargs)
            .all()
        )

        nested = build_tree(periods)

        return nested