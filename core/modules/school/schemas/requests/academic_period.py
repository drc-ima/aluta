from datetime import date, datetime
from typing import Optional
import uuid

from shared.data.schemas.requests.base_request import BaseRequest


class CreateCampusAcademicPeriodRequest(BaseRequest):
    name: str
    start_date: date
    end_date: date
    parent_id: Optional[uuid.UUID] = None