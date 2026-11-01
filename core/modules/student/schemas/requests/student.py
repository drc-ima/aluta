from datetime import date
from typing import Optional
import uuid

from fastapi import UploadFile
from pydantic import EmailStr

from shared.data.schemas.domain import StudentGender
from shared.data.schemas.requests.base_request import BaseRequest


class CreateGuardianRequest(BaseRequest):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    phone: str
    email: Optional[EmailStr] = None


class CreateStudentRequest(BaseRequest):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: date
    gender: StudentGender
    admission_date: Optional[date] = None
    admission_number: str
    guadian_id: Optional[uuid.UUID] = None
    guardian: CreateGuardianRequest
    profile: Optional[UploadFile] = None