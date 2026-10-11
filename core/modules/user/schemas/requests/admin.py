

import uuid

from pydantic import EmailStr, Field, field_validator

from shared.data.schemas.requests.base_request import BaseRequest


class CreateAdminRequest(BaseRequest):
    first_name: str
    last_name: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    role_id: uuid.UUID

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: str) -> str:

        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        return v

