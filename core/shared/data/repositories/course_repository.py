from shared.data.models import Course
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import CourseDomain


class CourseRepository(BaseRepository[Course, CourseDomain]):
    model = Course