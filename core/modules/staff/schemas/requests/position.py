import uuid
from typing import Optional
from shared.data.schemas.domain import EMPLOYMENT_TYPE
from shared.data.schemas.requests.base_request import BaseRequest

class CreatePositionRequest(BaseRequest):
    name: str
    description: Optional[str] = None
    employment_type: EMPLOYMENT_TYPE
    rank: Optional[str] = None
    