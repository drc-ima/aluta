
from shared.data.schemas.domain import UserType
from shared.data.schemas.requests.base_request import BaseRequest


class TokenRequest(BaseRequest):
    username: str
    password: str

class LoginRequest(TokenRequest):
    user_type: UserType