
from typing import Any, Generic, Protocol, TypeVar, cast

from pydantic import BaseModel
from sqlalchemy import insert, select
from sqlalchemy.orm import Session


DomainT = TypeVar("DomainT", bound=BaseModel)


class PydanticConvertible(Protocol):
    def to_pydantic(self) -> Any:
        ...


ModelT = TypeVar("ModelT", bound=PydanticConvertible)


class BaseRepository(Generic[ModelT, DomainT]):
    model: type[ModelT]

    @classmethod
    def create(
        cls,
        db: Session,
        data: DomainT,
    ) -> DomainT:
        model_cls = cast(Any, cls.model)

        obj = model_cls(
            **data.model_dump(exclude_unset=True)
        )

        db.add(obj)
        db.flush()
        db.refresh(obj)

        return cast(DomainT, obj.to_pydantic())

    @classmethod
    def update(
        cls,
        db: Session,
        data: dict[str, Any],
        filters: dict[str, Any],
    ) -> ModelT | None:
        instance = (
            db.query(cls.model)
            .filter_by(**filters)
            .first()
        )

        if instance is None:
            return None

        for key, value in data.items():
            if hasattr(cls.model, key):
                setattr(instance, key, value)

        db.flush()
        db.refresh(instance)

        return instance

    @classmethod
    def bulk_create(
        cls,
        db: Session,
        data: list[DomainT],
    ) -> list[DomainT]:
        if not data:
            return []

        model_cls = cast(Any, cls.model)

        values = [
            item.model_dump(exclude_unset=True)
            for item in data
        ]

        result = db.execute(
            insert(model_cls).returning(model_cls),
            values,
        )

        objects = result.scalars().all()

        return [
            cast(DomainT, obj.to_pydantic())
            for obj in objects
        ]

    @classmethod
    def get(
        cls,
        db: Session,
        **kwargs: Any,
    ) -> DomainT | None:
        statement = (
            select(cls.model)
            .filter_by(**kwargs)
        )

        obj = db.scalars(statement).first()

        if obj is None:
            return None

        return cast(DomainT, obj.to_pydantic())

    @classmethod
    def filter(
        cls,
        db: Session,
        **kwargs: Any,
    ) -> list[DomainT]:
        statement = (
            select(cls.model)
            .filter_by(**kwargs)
        )

        objects = db.scalars(statement).all()

        return [
            cast(DomainT, obj.to_pydantic())
            for obj in objects
        ]
