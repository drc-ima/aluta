from shared.data.models import StaffCampus
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StaffCampusDomain


class StaffCampusRepository(BaseRepository[StaffCampus, StaffCampusDomain]):

    model = StaffCampus