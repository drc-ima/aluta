from shared.data.models import Campus
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import CampusDomain


class CampusRepository(BaseRepository[Campus, CampusDomain]):

    model = Campus