
from typing import Optional
import uuid

from pydantic import EmailStr, Field, field_validator

from shared.data.schemas.domain import ContactType
from shared.data.schemas.requests.base_request import BaseRequest


class SchoolCreatorRequest(BaseRequest):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    email: EmailStr
    phone: Optional[str]
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:
    
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        return v


class CreateSchoolRequest(BaseRequest):
    name: str
    business_email: EmailStr
    website: Optional[str]


class CreateCampusContactRequest(BaseRequest):
    contact_type: ContactType
    contact: str

class CreateCampusRequest(BaseRequest):
    name: str
    gps_code: str
    address: Optional[str]
    contacts: list[CreateCampusContactRequest]

class RegisterSchoolRequest(BaseRequest):
    creator: SchoolCreatorRequest
    school: CreateSchoolRequest
    campus: CreateCampusRequest


class SchoolSerializer(CreateSchoolRequest):
    slug: str
    created_by_id: uuid.UUID
    domain: str