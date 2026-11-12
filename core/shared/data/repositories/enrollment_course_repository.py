from shared.data.models import EnrollmentCourse
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import EnrollmentCourseDomain


class EnrollmentCourseRepository(BaseRepository[EnrollmentCourse, EnrollmentCourseDomain]):
    model = EnrollmentCourse