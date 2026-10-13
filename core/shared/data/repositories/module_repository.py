from datetime import datetime, timezone
import uuid

from fastapi import HTTPException
from sqlalchemy import insert
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from shared.data.models import Module, SchoolModule
from shared.data.schemas.domain import ModuleDomain, SchoolModuleDomain


class ModuleRepository:

    def create_module(db: Session, data=ModuleDomain) -> ModuleDomain:

        user = get_user_id_email()
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")

        user_id = uuid.UUID(user.get("id"))
        created_at = datetime.now(timezone.utc)
        module = Module(
            **data.model_dump(exclude_unset=True),
            created_at=created_at,
            updated_at=created_at,
            created_by_id=user_id,
            updated_by_id=user_id
        )

        db.add(module)
        db.flush()
        db.refresh(module)

        return module.to_pydantic()

    def create_school_default_modules(self, db: Session, school_id: uuid.UUID, created_by_id: uuid.UUID) -> list[SchoolModuleDomain]:

        # user = get_user_id_email()
        # if not user:
        #     raise HTTPException(status_code=401, detail="Unauthorized")

        created_at = datetime.now(timezone.utc)
        default_modules = self.get_default_modules(db)

        school_module_objects = [
            SchoolModuleDomain(
                school_id=school_id,
                module_id=module.id,
                created_by_id=created_by_id,
                updated_by_id=created_by_id,
                created_at=created_at,
                updated_at=created_at
            ).model_dump(exclude_unset=True) for module in default_modules
        ]

        sm_data = db.execute(
            insert(SchoolModule).returning(SchoolModule),
            school_module_objects
        ).all()

        return [sm[0].to_pydantic() for sm in sm_data]

    def get_default_modules(self, db: Session) -> list[ModuleDomain]:

        modules = (
            db.query(Module)
            .filter(Module.default == True)
            .all()
        )

        return [module.to_pydantic() for module in modules]

    def get_school_modules(db: Session, school_id: uuid.UUID) -> list[SchoolModuleDomain]:

        sms = db.query(SchoolModule).filter(SchoolModule.school_id == school_id)

        return [sm.to_pydantic() for sm in sms]