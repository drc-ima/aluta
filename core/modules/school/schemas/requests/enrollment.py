from datetime import datetime
import uuid

from shared.data.schemas.requests.base_request import BaseRequest


class EnrollStudentRequest(BaseRequest):
    classroom_id: uuid.UUID
    student_id: uuid.UUID
    enrolled_at: datetime