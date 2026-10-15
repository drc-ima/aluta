from typing import Optional

from shared.data.schemas.requests.base_request import BaseRequest


class CreateSchoolDepartmentRequest(BaseRequest):

    name: str
    description: Optional[str] = None
    