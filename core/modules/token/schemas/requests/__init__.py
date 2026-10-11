
from shared.data.schemas.requests.base_request import BaseRequest


class TokenRequest(BaseRequest):
    username: str
    password: str