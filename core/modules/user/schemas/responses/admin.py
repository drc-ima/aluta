
from pydantic import BaseModel


class NewAdminResponse(BaseModel):
    message: str