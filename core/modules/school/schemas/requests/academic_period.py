from datetime import datetime
from typing import Optional
import uuid

from shared.data.schemas.requests.base_request import BaseRequest


class CreateCampusAcademicPeriodRequest(BaseRequest):
    school_id: uuid.UUID
    name: str
    start_date: datetime
    end_date: datetime
    parent_id: Optional[uuid.UUID] = None