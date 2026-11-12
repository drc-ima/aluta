from shared.data.models import Media
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import MediaDomain


class MediaRepository(BaseRepository[Media, MediaDomain]):
    model = Media
