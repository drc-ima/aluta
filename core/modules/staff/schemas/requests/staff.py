from datetime import datetime
import uuid
from typing import Optional
from shared.data.schemas.requests.base_request import BaseRequest
from pydantic import EmailStr


class CreateStaffRequest(BaseRequest):
    user_id: uuid.UUID
    staff_no: str
    school_id: uuid.UUID
    parent_id: uuid.UUID | None


class StaffUserRequest(BaseRequest):
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    role_id: Optional[uuid.UUID] = None

class StaffPositionRequest(BaseRequest):
    position_id: uuid.UUID
    start_date: datetime
    end_date: Optional[datetime]

class StaffInfoRequest(BaseRequest):
    staff_no: str
    parent_id: Optional[uuid.UUID] = None
    campus_id: uuid.UUID
    department_id: uuid.UUID

class NewStaffRequest(BaseRequest):
    user: StaffUserRequest
    staff_info: StaffInfoRequest
    positions: list[StaffPositionRequest]
    

