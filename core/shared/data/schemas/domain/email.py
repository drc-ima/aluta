from pydantic import BaseModel, EmailStr, Field


class EmailMessageSchema(BaseModel):
    to: list[EmailStr] = Field(min_length=1)
    subject: str = Field(min_length=1, max_length=200)
    body: str
    html_body: str | None = None


