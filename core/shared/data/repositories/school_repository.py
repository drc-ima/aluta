import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from modules.school.schemas.requests.school import CreateCampusRequest, RegisterSchoolRequest, SchoolSerializer
from shared.data.models import Campus, CampusContact, School, Staff
from shared.data.schemas.domain import CampusDomain, SchoolDomain
from shared.data.schemas.exceptions import RecordNotFoundException

class SchoolRepository:

    def get_school_by_domain(self, db: Session, domain: str) -> SchoolDomain | None:
        
        school = (
            db.query(School)
            .filter(School.domain == domain)
            .first()
        )

        return school.to_pydantic() if school else None

    def get_school_by_be(self, db: Session, email: str) -> SchoolDomain | None:

        school = (
            db.query(School)
            .filter(School.business_email == email.lower())
            .first()
        )

        return school.to_pydantic() if school else None
    
    def create_school(
            self, 
            db: Session,
            data: SchoolDomain
    ) -> SchoolDomain:

        school = School(
            **data.model_dump(exclude_unset=True)
        )

        db.add(school)

        db.flush()
        db.refresh(school)

        return school.to_pydantic()

    def create_main_campus(
        self,
        db: Session,
        data: CreateCampusRequest,
        school_id: uuid.UUID,
    ) -> CampusDomain:

        school = (
            db.query(School)
            .filter(School.id == school_id)
            .first()
        )

        if not school:
            raise RecordNotFoundException(
                "School", school_id
            )

        campus = Campus(
            name=data.name,
            gps_code=data.gps_code,
            address=data.address,
            is_main=True,
            school_id=school.id,
            created_by_id=school.created_by_id,
            updated_by_id=school.created_by_id
        )

        db.add(campus)
        db.flush()
        db.refresh(campus)

        contacts = [
            CampusContact(
                campus_id=campus.id,
                contact_type=contact.contact_type,
                contact=contact.contact,
                created_by_id=school.created_by_id,
                updated_by_id=school.created_by_id
            ) for contact in data.contacts
        ]

        db.bulk_save_objects(
            contacts,
            preserve_order=True,
        )

        db.flush()
        db.refresh(campus)

        return campus.to_pydantic()

    def get_campus_by_id(self, db: Session, campus_id: uuid.UUID) -> CampusDomain | None:

        campus = (
            db.query(Campus)
            .filter(Campus.id == campus_id)
            .first()
        )

        return campus.to_pydantic() if campus else None

    def activate_school(db: Session, school_id: uuid.UUID) -> SchoolDomain:
        school = db.query(School).get(school_id)

        if not school:
            raise RecordNotFoundException("School", school_id)

        school.verified = True
        school.active = True
        db.commit()
        db.flush()
        db.refresh(school)

        return school.to_pydantic()

    def deactivate_school(self, db: Session, school_id: uuid.UUID) -> SchoolDomain:

        school = db.query(School).get(school_id)

        if not school:
            raise RecordNotFoundException("School", school_id)

        school.active = False

        db.commit()
        db.flush()
        db.refresh(school)

        return school.to_pydantic()

    def get_schools_by_staff_ids(db: Session, staff_ids: list[uuid.UUID]) -> list[SchoolDomain]:

        schools = (
            db.query(School)
            .join(Staff)
            .filter(Staff.id.in_(staff_ids), School.active == True)
            .all()
        )

        return [school.to_pydantic() for school in schools]

    def get_staff_schools_with_campuses(db: Session, staff_ids: list[dict]):

        statement = (
            select(
                School.id.label("school_id"),
                Campus.id.label("campus_id"),
                School.name.label("school_name"),
                Campus.name.label("campus_name")
            )
            .join(Campus, Campus.school_id == School.id)
            .join(Staff, Staff.school_id == School.id)
            .filter(Staff.id.in_(staff_ids), School.active == True)
        )

        schools = db.execute(statement=statement).mappings().all()

        return schools