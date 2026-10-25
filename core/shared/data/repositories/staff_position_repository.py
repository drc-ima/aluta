from shared.data.models import StaffPosition
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StaffPositionDomain


class StaffPositionRepository(BaseRepository[StaffPosition, StaffPositionDomain]):
    model = StaffPosition