from datetime import datetime, timezone
import uuid

from sqlalchemy import and_, not_

from handlers.exceptions import exception_catcher
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.school.schemas.requests.classrooms import AssignClassroomCourseStaffRequest, AssignClassroomStaffRequest, BulkCreateClassroomsRequest
from shared.data.models import Classroom, ClassroomCourseStaff, Enrollment, Media, SchoolClass, Student
from shared.data.repositories.academic_period_repository import AcademicPeriodRepository
from shared.data.repositories.classroom_course_staff_repository import ClassroomCourseStaffRepository
from shared.data.repositories.classroom_repository import ClassroomRepository
from shared.data.repositories.classroom_staff_assignment_repository import ClassroomStaffAssignmentRepository
from shared.data.repositories.course_repository import CourseRepository
from shared.data.repositories.enrollment_repository import EnrollmentRepository
from shared.data.repositories.staff_repository import StaffRepository
from shared.data.schemas.domain import ClassroomCourseStaffDomain, ClassroomDomain, ClassroomStaffAssignmentDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException


class ClassroomServices:
    @exception_catcher
    async def create_bulk_classrooms(db: Session, academic_period_id: uuid.UUID, request: BulkCreateClassroomsRequest):
        try:
            with db.begin():
                # check if academic period exists
                academic_period = AcademicPeriodRepository.get(db, id=academic_period_id)

                created_at = datetime.now(timezone.utc)
                created_by = get_user_id_email()
                if not academic_period:
                    raise RecordNotFoundException("AcademicPeriod", academic_period_id)

                data = [
                    ClassroomDomain(
                        school_class_id=classroom.school_class_id,
                        academic_period_id=academic_period_id,
                        created_by_id=created_by.get("id"),
                        updated_by_id=created_by.get("id"),
                        updated_at=created_at
                    ) for classroom in request.classrooms
                ]

                bulk_upsert = await ClassroomRepository().bulk_upsert(
                    db=db,
                    data=data,
                    conflict_fields=["school_class_id", "academic_period_id"],
                    update_fields=["updated_by_id", "updated_at"]
                )

                return bulk_upsert
        except Exception as e:
            logger.error(f"Service: Error creating classrooms: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def fetch_classrooms(db: Session, academic_period_id: uuid.UUID):
        try:
            classes = ClassroomRepository(ordering=(SchoolClass.level.asc(),)).filter(db, academic_period_id=academic_period_id)

            return [cls.model_dump(mode="json") for cls in classes]
        except Exception as e:
            logger.error(f"Service: Error fetching classrooms: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def fetch_classroom(db: Session, academic_period_id: uuid.UUID, classroom_id: uuid.UUID):
        try:
            classroom = ClassroomRepository.get(db, academic_period_id=academic_period_id, id=classroom_id)

            if not classroom:
                raise RecordNotFoundException("Classroom", classroom_id)

            # check if the classroom has sections
            sections = (
                db.query(Classroom)
                .join(SchoolClass)
                .filter(
                    SchoolClass.level==classroom.school_class.level
                ).all()
            )

            # fetch classroom courses

            courses = ClassroomCourseStaffRepository.filter(
                db, classroom_id=classroom.id
            )

            # enrollments
            students = (
                db.query(Student)
                .join(Enrollment, Student.id == Enrollment.student_id)
                .join(Media, and_(Media.entity_id == Student.id, Media.media_type == "profile"))
                .filter(Enrollment.classroom_id == classroom.id)
                .all()
            )

            next_level = classroom.school_class.level + 1
            previous_level = classroom.school_class.level - 1

            next_classroom = (
                db.query(Classroom)
                .join(SchoolClass)
                .filter(
                    SchoolClass.level==next_level, 
                    Classroom.academic_period_id==classroom.academic_period_id
                ).first()
            )

            previous_classroom = (
                db.query(Classroom)
                .join(SchoolClass)
                .filter(
                    SchoolClass.level==previous_level, 
                    Classroom.academic_period_id==classroom.academic_period_id
                ).first()
            )

            return {
                **classroom.model_dump(),
                "courses": [course.model_dump() for course in courses],
                "students": [student.to_pydantic().model_dump() for student in students],
                "sections": [section.to_pydantic().model_dump() for section in sections],
                "next_id": next_classroom.id if next_classroom else None,
                "previous_id": previous_classroom.id if previous_classroom else None
            }
        except Exception as e:
            logger.error(f"Service: Error fetching classrooms: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def assign_classroom_course_and_staff(db: Session, request: AssignClassroomCourseStaffRequest):

        try:
            with db.begin():

                classroom = ClassroomRepository.get(db, id=request.classroom_id)

                if not classroom:
                    raise RecordNotFoundException("Classroom", request.classroom_id)

                staff = StaffRepository.get(db, id=request.staff_id)

                if not staff:
                    raise RecordNotFoundException("Staff", request.staff_id)

                course = CourseRepository.get(db, id=request.course_id)

                if not course:
                    raise RecordNotFoundException("Course", request.course_id)

                created_by_id = get_user_id_email().get("id")
                data = ClassroomCourseStaffDomain(
                    classroom_id=classroom.id,
                    academic_period_id=classroom.academic_period_id,
                    staff_id=staff.id,
                    course_id=course.id,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                created = ClassroomCourseStaffRepository.create(
                    db=db,
                    data=data
                )

                return created
        except Exception as e:
            logger.error(f"Service: Error assigning classroom course: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def assign_classroom_staff(db: Session, request: AssignClassroomStaffRequest):
        try:
            with db.begin():
                classroom = ClassroomRepository.get(db, id=request.classroom_id)
                
                if not classroom:
                    raise RecordNotFoundException("Classroom", request.classroom_id)
                
                staff = StaffRepository.get(db, id=request.staff_id)
                
                if not staff:
                    raise RecordNotFoundException("Staff", request.staff_id)

                # check if the staff has already been assigned to this classroom
                already_assigned = ClassroomStaffAssignmentRepository.get(
                    db,
                    classroom_id=classroom.id,
                    staff_id=staff.id
                )

                if already_assigned:
                    raise RecordAlreadyExistsException("Classroom Staff", already_assigned.id)
                
                created_by_id = get_user_id_email().get("id")
                # if head is true, update the previous head to false
                if request.head:
                    ClassroomStaffAssignmentRepository.update(
                        db,
                        {"head": False, "updated_by_id": created_by_id, "updated_at": datetime.now(timezone.utc)},
                        {"classroom_id": classroom.id}
                    )
                
                data = ClassroomStaffAssignmentDomain(
                    classroom_id=classroom.id,
                    staff_id=staff.id,
                    head=request.head,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                created = ClassroomStaffAssignmentRepository.create(
                    db,
                    data
                )

                return created
        except Exception as e:
            logger.error(f"Service: Error assigning classroom staff: {e}")
            db.rollback()
            raise
        finally:
            db.close()