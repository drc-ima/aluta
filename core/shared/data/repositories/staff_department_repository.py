from shared.data.models import StaffDepartment
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import StaffDepartmentDomain


class StaffDepartmentRepository(BaseRepository[StaffDepartment, StaffDepartmentDomain]):

    model = StaffDepartment