
from datetime import datetime, timezone
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from handlers.exceptions import exception_catcher
from middlewares.logging.logger import logger
from modules.school.schemas.requests.school import RegisterSchoolRequest, SchoolSerializer
from modules.staff.schemas.requests.staff import CreateStaffRequest
from modules.user.schemas.requests.user import CreateUserRequest, VerifyTokenRequest
from shared.data.repositories.module_repository import ModuleRepository
from shared.data.repositories.role_repository import RoleRepository
from shared.data.repositories.school_repository import SchoolRepository
from shared.data.repositories.staff_repository import StaffRepository
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import RoleDomain, SchoolDomain, StaffDomain, UserDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException
from shared.utils.school import generate_domain
from shared.utils.token import TokenTypes, decode_token


class SchoolServices:
    
    @exception_catcher
    def register_school_service(self, db: Session, request: RegisterSchoolRequest) -> SchoolDomain:
        try:
            with db.begin():
                # create user
                # check if useranme already exist
                existing_user = UserRepository().get_by_username(db, request.creator.email)
                if existing_user:
                    raise RecordAlreadyExistsException("User", request.creator.email)

                # # check if role exist and is a default role
                # existing_role = RoleRepository().get_by_id(db, request.creator.role_id)

                # if not existing_role:
                #     raise RecordNotFoundException("Role", request.creator.role_id)

                # if existing_role.default == False:
                #     raise HTTPException(
                #         status_code=status.HTTP_409_CONFLICT,
                #         detail="Invalid role selected"
                #     )
                
                user_data = UserDomain(
                    first_name=request.creator.first_name,
                    last_name=request.creator.last_name,
                    middle_name=request.creator.middle_name,
                    email=request.creator.email,
                    phone=request.creator.phone,
                    password=request.creator.password,
                    # role_id=request.creator.role_id,
                    user_type="SCHOOL",
                    username=request.creator.email.lower(),
                    is_active=False,
                    verified=False,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc),
                )
                user = UserRepository().create_user(db, data=user_data)

                # create school
                # check if school business email already exist
                existing_school = SchoolRepository().get_school_by_be(db, request.school.business_email)

                if existing_school:
                    raise RecordAlreadyExistsException("School", existing_school.business_email)

                domain = generate_domain(request.school.name)
                slug = domain.split("@")[0]
                school_data = SchoolDomain(
                    name=request.school.name,
                    business_email=request.school.business_email.lower(),
                    website=request.school.website.lower(),
                    domain=domain,
                    slug=slug,
                    created_by_id=user.id,
                    updated_by_id=user.id,
                    active=False,
                    verified=False,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                school = SchoolRepository().create_school(db, data=school_data)

                # create default modules for school
                # TODO: Create default modules for the verified school
                modules = ModuleRepository().create_school_default_modules(db, school_id=school.id, created_by_id=user.id)

                # add administrator role for the school
                role_data = RoleDomain(
                    name="School Administrator",
                    default=False,
                    school_id=school.id,
                    created_by_id=user.id,
                    updated_by_id=user.id,
                    created_at=datetime.now(timezone.utc)
                )
                role = RoleRepository().create_school_role(db, role_data=role_data)

                # create role permissions
                module_permissions = []
                for module in modules:
                    for permission in module.module.permissions:
                        module_permissions.append(permission.id)

                RoleRepository().create_role_permissions(db, role.id, module_permissions)

                # assign user to the role

                RoleRepository().create_user_role(db, user.id, role_id=role.id, created_by_id=user.id)
                
                # create main campus
                campus = SchoolRepository().create_main_campus(db, data=request.campus, school_id=school.id)

                staff_data = StaffDomain(
                    user_id=user.id,
                    staff_no="NEW-00001",
                    school_id=school.id,
                    parent_id=None,
                    active=True,
                    created_by_id=user.id,
                    updated_by_id=user.id,
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )

                # create staff 
                staff = StaffRepository().create_staff(db, data=staff_data)

                # staff campus
                staff_campus = StaffRepository().create_staff_campus(db, staff_id=staff.id, campus_id=campus.id, created_by_id=user.id)
                
                return school
        except Exception as e:
            logger.error(f"Service: Error registering school: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def verify_school(db: Session, data: VerifyTokenRequest):
        try:
            # decode token
            decoded = decode_token(data.token, TokenTypes.verify)
        
            # get school from payload
            school_id = uuid.UUID(decoded.get("sub"))
            school = SchoolRepository.activate_school(db, school_id=school_id)

            return school if school else None
        except Exception as e:
            logger.error(f"Service: Error verifying school: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def user_active_schools(self, db: Session, user_id: uuid.UUID) -> list[SchoolDomain]:

        try:
            staffs: list[StaffDomain] = StaffRepository.get_user_staffs(db, user_id)

            staff_ids = [staff.id for staff in staffs]

            schools: list[SchoolDomain] = SchoolRepository.get_schools_by_staff_ids(db, staff_ids)

            return schools

        except Exception as e:
            logger.error(f"Service: Error fetching school: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def user_schools_campuses(self, db: Session, user_id: uuid.UUID) -> list[dict]:
        try:
            staffs: list[StaffDomain] = StaffRepository.get_user_staffs(db, user_id)

            staff_ids = [staff.id for staff in staffs]

            schools = SchoolRepository.get_staff_schools_with_campuses(db, staff_ids)

            return schools

        except Exception as e:
            logger.error(f"Service: Error fetching school: {e}")
            db.rollback()
            raise
        finally:
            db.close()