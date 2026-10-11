
import uuid

from pydantic import BaseModel


class SchoolResponse(BaseModel):
    message: str
    school_id: uuid.UUID