from shared.data.models import Classroom
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import ClassroomDomain


class ClassroomRepository(BaseRepository[Classroom, ClassroomDomain]):
    model = Classroom