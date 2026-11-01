from shared.data.models import SchoolClass
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import SchoolClassDomain


class SchoolClassRepository(BaseRepository[SchoolClass, SchoolClassDomain]):

    model = SchoolClass
    ordering = (SchoolClass.code)