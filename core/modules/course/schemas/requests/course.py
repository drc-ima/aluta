from typing import Optional
import uuid

from shared.data.schemas.requests.base_request import BaseRequest


class CreateCourseRequest(BaseRequest):
    name: str
    code: str
    description: Optional[str] = None
    department_id:  Optional[uuid.UUID] = None