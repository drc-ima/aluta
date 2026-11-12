from shared.data.models import StudentGuardian
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StudentGuardianDomain


class StudentGuardianRepository(BaseRepository[StudentGuardian, StudentGuardianDomain]):
    model = StudentGuardian