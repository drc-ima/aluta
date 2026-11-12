from datetime import datetime
from typing import Optional
import uuid

from fastapi import UploadFile, File
from pydantic import EmailStr, Field

from shared.data.schemas.domain import StudentGender
from shared.data.schemas.requests.base_request import BaseRequest


class GuardianRequest(BaseRequest):
    first_name: str
    # middle_name: Optional[str] = None
    last_name: str
    phone: str
    email: Optional[EmailStr] = None
    guardian_id: Optional[uuid.UUID] = None
    relationship_type: str

class Profile(BaseRequest):
    filename: str
    data: str

class StudentBioRequest(BaseRequest):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: datetime
    gender: StudentGender
    admission_date: Optional[datetime] = None
    admission_number: str
    profile: Optional[Profile] = None
    classroom_id: uuid.UUID
    enrolled_at: datetime

class CreatedStudentRequest(BaseRequest):
    bio: StudentBioRequest
    guardians: list[GuardianRequest] = Field(default_factory=list)
