from shared.data.models import Token
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import TokenDomain


class TokenRepository(BaseRepository[Token, TokenDomain]):
    model = Token
