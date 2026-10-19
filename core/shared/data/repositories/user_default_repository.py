from shared.data.models import UserDefaultModule
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import UserDefaultModuleDomain
from sqlalchemy.orm import Session


class UserDefaultRepository(BaseRepository[UserDefaultModule, UserDefaultModuleDomain]):
    model = UserDefaultModule
    