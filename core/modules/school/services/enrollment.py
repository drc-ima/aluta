import uuid
from fastapi import HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session
from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.school.schemas.requests.enrollment import EnrollStudentRequest
from shared.data.models import AcademicPeriod, Classroom, Enrollment
from shared.data.repositories.classroom_course_staff_repository import ClassroomCourseStaffRepository
from shared.data.repositories.classroom_repository import ClassroomRepository
from shared.data.repositories.enrollment_course_repository import EnrollmentCourseRepository
from shared.data.repositories.enrollment_repository import EnrollmentRepository
from shared.data.repositories.enrollment_status_repository import EnrollmentStatusRepository
from shared.data.schemas.domain import EnrollmentCourseDomain, EnrollmentDomain, EnrollmentStatusDomain
from shared.data.schemas.exceptions import RecordAlreadyExistsException, RecordNotFoundException


class EnrollmentServices:

    def create_enrollment(db: Session, request: EnrollStudentRequest) -> EnrollmentDomain:

        try:
            with db.begin():
                created_by_id = get_user_id_email().get("id")

                # check if classroom exists
                classroom = ClassroomRepository.get(db, id=request.classroom_id)
                if not classroom:
                    raise RecordNotFoundException("Classroom", request.classroom_id)

                # check if student has already been enrolled to the classroom
                already_in_enrolled = EnrollmentRepository.get(db, classroom_id=request.classroom_id, student_id=request.student_id)

                if already_in_enrolled:
                    raise RecordAlreadyExistsException("Enrollment", already_in_enrolled.id)

                # check if the student has not already been assigned to a classroom in the academic year
                already_enrolled = (
                    db.query(Enrollment)
                    .join(Classroom, Classroom.id == Enrollment.classroom_id)
                    .join(AcademicPeriod, AcademicPeriod.id == Classroom.academic_period_id)
                    .filter(and_(
                        Enrollment.student_id == request.student_id,
                        Classroom.academic_period_id == classroom.academic_period_id
                    )).first()
                )

                if already_enrolled:
                    raise HTTPException(
                        status_code=400,
                        detail=f"This student has already been enrolled in {already_enrolled.classroom.school_class.name}."
                    )
                
                enrollment_data = EnrollmentDomain(
                    classroom_id=request.classroom_id,
                    enrolled_at=request.enrolled_at.date(),
                    student_id=request.student_id,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                created = EnrollmentRepository.create(db, enrollment_data)

                status_data = EnrollmentStatusDomain(
                    enrollment_id=created.id,
                    name="Enrolled",
                    start_date= request.enrolled_at.date(),
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                EnrollmentStatusRepository.create(db, status_data)

                # enroll courses
                classroom_courses = ClassroomCourseStaffRepository.filter(db, classroom_id=created.classroom_id)
                courses_data = [
                    EnrollmentCourseDomain(
                        enrollment_id=created.id,
                        course_id=course.id,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id
                    ) for course in classroom_courses
                ]
                
                EnrollmentCourseRepository.bulk_create(db, courses_data)

                return created

        except Exception as e:
            logger.error(f"Service: Error enrolling student: {e}")
            db.rollback()
            raise
        finally:
            db.close()