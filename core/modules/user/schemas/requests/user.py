
from enum import Enum
from typing import Optional
import uuid

from pydantic import EmailStr, Field, field_validator

from shared.data.schemas.domain import UserType
from shared.data.schemas.requests.base_request import BaseRequest


class UsernameField(str, Enum):
    Email = "Email"
    Phone = "Phone"

class CreateUserRequest(BaseRequest):
    first_name: str
    last_name: str
    middle_name: Optional[str]
    email: EmailStr
    password: str = Field(..., min_length=8)
    user_type: UserType
    phone: str
    role_id: Optional[uuid.UUID]
    username_field: UsernameField

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:

        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        return v


class VerifyTokenRequest(BaseRequest):
    token: str

class VerifyTokenResponse(BaseRequest):
    message: str


class UserDefaultRequest(BaseRequest):
    entity_id: uuid.UUID
    module_name: str


class UserDefaultsRequest(BaseRequest):
    defaults: list[UserDefaultRequest] = []