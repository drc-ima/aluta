from typing import Any, Generic, Protocol, TypeVar, Unpack, cast
import uuid

from pydantic import BaseModel
from sqlalchemy import insert, inspect, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

DomainT = TypeVar("DomainT", bound=BaseModel)


class PydanticConvertible(Protocol):
    def to_pydantic(self) -> Any: ...


ModelT = TypeVar("ModelT", bound=PydanticConvertible)


class BaseRepository(Generic[ModelT, DomainT]):
    model: type[ModelT]

    ordering: tuple = ()

    def __init__(self, ordering: tuple = ()):

        self.ordering = ordering

    @classmethod
    def create(
        cls,
        db: Session,
        data: DomainT,
    ) -> DomainT:
        model_cls = cast(Any, cls.model)

        obj = model_cls(**data.model_dump(exclude_unset=True))

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
    ) -> DomainT | None:
        instance = db.query(cls.model).filter_by(**filters).first()

        if instance is None:
            return None

        for key, value in data.items():
            if hasattr(cls.model, key):
                setattr(instance, key, value)

        db.flush()
        db.refresh(instance)

        return cast(DomainT, instance.to_pydantic())

    @classmethod
    def bulk_create(
        cls,
        db: Session,
        data: list[DomainT],
    ) -> list[DomainT]:
        if not data:
            return []

        model_cls = cast(Any, cls.model)

        values = [item.model_dump(exclude_unset=True) for item in data]

        result = db.execute(
            insert(model_cls).returning(model_cls),
            values,
        )

        objects = result.scalars().all()

        return [cast(DomainT, obj.to_pydantic()) for obj in objects]

    @classmethod
    def get(
        cls,
        db: Session,
        **kwargs: Any,
    ) -> DomainT | None:
        statement = select(cls.model).filter_by(**kwargs)

        obj = db.scalars(statement).first()

        if obj is None:
            return None

        return cast(DomainT, obj.to_pydantic())

    @classmethod
    def filter(cls, db: Session, **kwargs: Unpack[DomainT]) -> list[DomainT]:
        statement = (select(cls.model).filter_by(**kwargs))

        objects = db.scalars(statement).all()

        return [cast(DomainT, obj.to_pydantic()) for obj in objects]

    @classmethod
    def upsert(
        cls,
        db: Session,
        conflict_fields: list[str],
        data: DomainT,
        update_fields: list[str] | None = None
    ) -> DomainT: 
        model_cls = cast(Any, cls.model)
        data_obj = model_cls(**data.model_dump(exclude_unset=True))

        cls._validate_fields(conflict_fields)

        if update_fields is None:
            update_fields = [
                field 
                for field in data_obj
                if field not in conflict_fields
            ]

        cls._validate_fields(update_fields)

        if not conflict_fields:
            raise ValueError("conflict_fields cannot be empty")

        if not update_fields:
            raise ValueError("No fields available for updating")

        stmt = pg_insert(cls.model).values(**data_obj)

        stmt = stmt.on_conflict_do_update(
            index_elements=conflict_fields,
            set_={
                field: getattr(stmt.excluded, field)
                for field in update_fields
            }
        ).returning(cls.model)

        result = db.execute(stmt)

        obj = result.scalar_one()

        return obj.to_pydantic()

    async def bulk_upsert(
        cls,
        db: Session,
        data: list[DomainT],
        conflict_fields: list[str],
        update_fields: list[str] | None = None,
    ) -> list[DomainT]:
        """
        Insert multiple records or update existing records.
        """

        data_objs = [item.model_dump(exclude_unset=True) for item in data]

        if not data_objs:
            return []

        if not conflict_fields:
            raise ValueError("conflict_fields cannot be empty")

        cls._validate_fields(conflict_fields)

        if update_fields is None:
            update_fields = [
                field
                for field in data_objs[0]
                if field not in conflict_fields
            ]

        cls._validate_fields(update_fields)

        if not update_fields:
            raise ValueError("No fields available for updating")

        for record in data_objs:
            missing = set(conflict_fields) - set(record)

            if missing:
                raise ValueError(
                    f"Missing conflict fields: {', '.join(missing)}"
                )

        stmt = pg_insert(cls.model).values(data_objs)

        stmt = stmt.on_conflict_do_update(
            index_elements=conflict_fields,
            set_={
                field: getattr(stmt.excluded, field)
                for field in update_fields
            },
        ).returning(cls.model)

        result = db.execute(stmt)

        results = result.scalars().all()
        return [cast(DomainT, obj.to_pydantic()) for obj in results]

    def _validate_fields(
        cls,
        fields: list[str]
    ) -> None:
        valid_fields = {
            column.key for column in inspect(cls.model).columns
        }

        invalid_fields = set(fields) - valid_fields

        if invalid_fields:
            raise ValueError(
                f"Invalid field for {cls.model.__name__}: "
                f"{', '.join(invalid_fields)}"
            )
