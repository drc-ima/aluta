
from datetime import datetime, timezone
from typing import Any
import uuid

from handlers.exceptions import exception_catcher
from sqlalchemy.orm import Session

from middlewares.context.request import get_user_id_email
from middlewares.logging.logger import logger
from modules.student.schemas.requests.student import CreatedStudentRequest
from shared.data.repositories.classroom_course_staff_repository import ClassroomCourseStaffRepository
from shared.data.repositories.enrollment_course_repository import EnrollmentCourseRepository
from shared.data.repositories.enrollment_repository import EnrollmentRepository
from shared.data.repositories.enrollment_status_repository import EnrollmentStatusRepository
from shared.data.repositories.guardian_repository import GuardianRepository
from shared.data.repositories.media_repository import MediaRepository
from shared.data.repositories.student_guardian_repository import StudentGuardianRepository
from shared.data.repositories.student_repository import StudentRepository
from shared.data.repositories.department_repository import DepartmentRepository
from shared.data.schemas.domain import EnrollmentCourseDomain, EnrollmentDomain, EnrollmentStatusDomain, GuardianDomain, MediaDomain, StudentDomain, StudentGuardianDomain
from shared.data.schemas.exceptions import RecordNotFoundException
from shared.services.local_media import MediaServices

class StudentServices:

    @exception_catcher
    def get_school_students(db: Session, school_id: uuid.UUID, **params: Any) -> dict:

        students = StudentRepository().paginated_filter(db, school_id=school_id, **params)

        return students

    @exception_catcher
    async def create_campus_student(db: Session, request: CreatedStudentRequest, campus_id: uuid.UUID, school_id: uuid.UUID) -> StudentDomain:

        try:
            with db.begin():
                created_by_id = get_user_id_email().get("id")
                created_at = datetime.now(timezone.utc)

                # check if department exist
                student_data = StudentDomain(
                    first_name=request.bio.first_name,
                    last_name=request.bio.last_name,
                    middle_name=request.bio.middle_name,
                    date_of_birth=request.bio.date_of_birth.date(),
                    gender=request.bio.gender,
                    admission_date=request.bio.admission_date.date(),
                    admission_number=request.bio.admission_number,
                    campus_id=campus_id,
                    school_id=school_id,
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                student = StudentRepository.create(db, student_data)

                to = f"{student.id}/profile"
                blob_url = MediaServices().base64_upload(to, request.bio.profile.data, request.bio.profile.filename)
                
                profile_data = MediaDomain(
                    entity_id=student.id,
                    blob_url=blob_url,
                    media_type="profile",
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                MediaRepository.create(db, profile_data)

                # create guardian
                guardians_data = []

                for guardian in request.guardians:
                    guardian_obj = None

                    if guardian.guardian_id:
                        guardian_obj = GuardianRepository.get(db, id=guardian.guardian_id)
                    else:
                        guardian_data = GuardianDomain(
                            school_id=school_id,
                            first_name=guardian.first_name,
                            last_name=guardian.last_name,
                            phone=guardian.phone,
                            email=guardian.email,
                            created_by_id=created_by_id,
                            updated_by_id=created_by_id
                        )

                        guardian_obj = GuardianRepository.create(db, guardian_data)

                    student_guardian_data = StudentGuardianDomain(
                        student_id=student.id,
                        guardian_id=guardian_obj.id,
                        relationship_type=guardian.relationship_type,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id
                    )

                    guardians_data.append(student_guardian_data)
                
                StudentGuardianRepository.bulk_create(db, guardians_data)

                # enroll to class

                enrollment_data = EnrollmentDomain(
                    student_id=student.id,
                    classroom_id=request.bio.classroom_id,
                    enrolled_at=request.bio.enrolled_at.date(),
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                enrollment = EnrollmentRepository.create(db, enrollment_data)

                status_data = EnrollmentStatusDomain(
                    enrollment_id=enrollment.id,
                    name="Enrolled",
                    created_by_id=created_by_id,
                    updated_by_id=created_by_id
                )

                EnrollmentStatusRepository.create(db, status_data)

                # enroll courses
                classroom_courses = ClassroomCourseStaffRepository.filter(db, classroom_id=enrollment.classroom_id)
                courses_data = [
                    EnrollmentCourseDomain(
                        enrollment_id=enrollment.id,
                        course_id=course.id,
                        created_by_id=created_by_id,
                        updated_by_id=created_by_id
                    ) for course in classroom_courses
                ]

                EnrollmentCourseRepository.bulk_create(db, courses_data)

                return student
        except Exception as e:
            logger.error(f"Service: Error creating student: {e}")
            db.rollback()
            raise
        finally:
            db.close()