from shared.data.models import Enrollment
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import EnrollmentDomain


class EnrollmentRepository(BaseRepository[Enrollment, EnrollmentDomain]):
    model = Enrollment