import uuid

from shared.data.schemas.requests.base_request import BaseRequest


class CreateStaffRequest(BaseRequest):
    user_id: uuid.UUID
    staff_no: str
    school_id: uuid.UUID
    parent_id: uuid.UUID | None