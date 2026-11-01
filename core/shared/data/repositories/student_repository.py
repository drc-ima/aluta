from shared.data.models import Student
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StudentDomain


class StudentRepository(BaseRepository[Student, StudentDomain]):

    model = Student