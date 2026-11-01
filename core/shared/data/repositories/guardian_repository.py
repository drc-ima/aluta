from shared.data.models import Guardian
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import GuardianDomain


class GuardianRepository(BaseRepository[Guardian, GuardianDomain]):
    model = Guardian