
from shared.data.models import EnrollmentStatus
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import EnrollmentStatusDomain


class EnrollmentStatusRepository(BaseRepository[EnrollmentStatus, EnrollmentStatusDomain]):
    model = EnrollmentStatus