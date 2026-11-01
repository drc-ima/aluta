from shared.data.models import ClassCourseInstructor
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import ClassCourseInstructorDomain


class ClassCourseInstructorRepository(BaseRepository[ClassCourseInstructor, ClassCourseInstructorDomain]):

    model = ClassCourseInstructor