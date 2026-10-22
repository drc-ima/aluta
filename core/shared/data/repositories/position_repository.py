from shared.data.repositories.repository import BaseRepository
from shared.data.models import Position, PositionDomain


class PositionRepository(BaseRepository[Position, PositionDomain]):
    model = Position

