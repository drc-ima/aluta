
from datetime import datetime, timezone
from typing import Any
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from handlers.exceptions import exception_catcher
from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.staff.schemas.requests.staff import NewStaffRequest
from shared.data.repositories.staff_campus_repository import StaffCampusRepository
from shared.data.repositories.campus_repository import CampusRepository
from shared.data.repositories.department_repository import DepartmentRepository
from shared.data.repositories.school_repository import SchoolRepository
from shared.data.repositories.staff_department_repository import StaffDepartmentRepository
from shared.data.repositories.staff_position_repository import StaffPositionRepository
from shared.data.repositories.staff_repository import StaffRepository
from shared.data.repositories.user_repository import UserRepository
from shared.data.schemas.domain import StaffCampusDomain, StaffDepartmentDomain, StaffDomain, StaffPositionDomain, UserDomain, UserInputDomain, UserType
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException


class StaffServices:

    @exception_catcher
    def get_school_staff(db: Session, **params: Any) -> dict:
        try:
            staff = StaffRepository().paginated_filter(db, **params)

            return staff
        except Exception as e:
            logger.error(f"Service: Error fetching staff: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    @exception_catcher
    def add_school_staff(db: Session, school_id: uuid.UUID, request: NewStaffRequest) -> StaffDomain:
        try:
            with db.begin():

                # check if provided ids exists
                school = SchoolRepository.get(db, id=school_id)

                if not school:
                    raise RecordNotFoundException("School", school_id)

                campus = CampusRepository.get(db, school_id=school_id, id=request.staff_info.campus_id)

                if not campus:
                    raise RecordNotFoundException("Campus", request.staff_info.campus_id)

                department = DepartmentRepository.get(db, id=request.staff_info.department_id, school_id=school_id)

                if not department:
                    raise RecordNotFoundException("Department", request.staff_info.department_id)

                staff = StaffRepository.get(db, staff_no=request.staff_info.staff_no, school_id=school_id)

                if staff:
                    raise RecordAlreadyExistsException("Staff", request.staff_info.staff_no)

                parent = None
                if request.staff_info.parent_id:
                    parent = StaffRepository.get(db, id=request.staff_info.parent_id, school_id=school_id)
                    if not parent:
                        raise RecordAlreadyExistsException("Staff", request.staff_info.parent_id)
                
                # if user with same email does not exists, create a new inactive
                created_by_id = get_user_id_email().get("id")
                created_at = datetime.now(timezone.utc)

                user = UserRepository().get_by_username(db, request.user.email)
                if not user:
                    user_data = UserInputDomain(
                        first_name=request.user.first_name,
                        middle_name=request.user.middle_name,
                        last_name=request.user.last_name,
                        email=request.user.email,
                        phone=request.user.phone,
                        username=request.user.email,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id,
                        created_at=created_at,
                        updated_at=created_at,
                        user_type=UserType.SCHOOL,
                        is_active=False,
                        verified=False
                    )

                    user = UserRepository().create_user(db, user_data)

                # create staff
                staff_data = StaffDomain(
                    user_id=user.id,
                    staff_no=request.staff_info.staff_no,
                    school_id=school_id,
                    active=True,
                    parent_id=request.staff_info.parent_id,
                    created_at=created_at,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id,
                    updated_at=created_at
                )

                staff = StaffRepository.create(db, staff_data)

                # create staff campus
                staff_campus_data = StaffCampusDomain(
                    staff_id=staff.id,
                    campus_id=campus.id,
                    created_at=created_at,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id,
                    updated_at=created_at
                )

                staff_campus = StaffCampusRepository.create(db, staff_campus_data)

                # create staff department
                staff_department_data = StaffDepartmentDomain(
                    staff_id=staff.id,
                    department_id=request.staff_info.department_id,
                    created_at=created_at,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id,
                    updated_at=created_at
                )

                staff_department = StaffDepartmentRepository.create(db, staff_department_data)

                # create positions
                positions_data = [
                    StaffPositionDomain(
                        staff_id=staff.id,
                        position_id=position.position_id,
                        start_date=position.start_date,
                        end_date=position.end_date,
                        created_at=created_at,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id,
                        updated_at=created_at
                    ) for position in request.positions
                ]

                positions = StaffPositionRepository.bulk_create(db, positions_data)

                refreshed_staff = StaffRepository.get(db, id=staff.id)

                return refreshed_staff
        except Exception as e:
            logger.error(f"Service: Error creating academic period: {e}")
            db.rollback()
            raise
        finally:
            db.close()