from typing import Any

from sqlalchemy import insert

from shared.data.models import Department
from shared.data.schemas.domain import DepartmentDomain
from sqlalchemy.orm import Session


class DepartmentRepository:
    def create(db: Session, data:DepartmentDomain) -> DepartmentDomain:

        ap = Department(
            **data.model_dump(exclude_unset=True)
        )

        db.add(ap)

        db.flush()
        db.refresh(ap)

        return ap.to_pydantic()

    def bulk_create(db: Session, data: list[DepartmentDomain]) -> list[DepartmentDomain]:

        if not data:
            return []

        ap_objects = []

        for ap in data:
            ap.model_dump(exclude_unset=True)
            ap_objects.append(ap)

        ap_data = db.execute(
            insert(Department).returning(Department),
            ap_objects
        ).all()

        return [ap[0].to_pydantic() for ap in ap_data]

    def get(db: Session, **kwargs: Any) -> DepartmentDomain | None:
        period = (
            db.query(Department)
            .filter_by(**kwargs)
            .first()
        )

        if period is None:
            return None

        return period.to_pydantic()

    def filter(db: Session, **kwargs) -> list[DepartmentDomain]:

        periods = (
            db.query(Department)
            .filter_by(**kwargs)
            .all()
        )

        return [period.to_pydantic() for period in periods]
