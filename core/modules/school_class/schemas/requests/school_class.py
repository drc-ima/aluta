from typing import Optional

from pydantic import Field, field_validator, model_validator

from shared.data.schemas.requests.base_request import BaseRequest


class SectionRequest(BaseRequest):
    name: str = Field(min_length=1, max_length=50)

class CreateRangeSchoolClassRequest(BaseRequest):
    prefix: str = Field(min_length=1, max_length=50)
    start: int = Field(ge=1)
    end: int = Field(ge=1)
    capacity: int = Field(ge=1)
    sections: list[SectionRequest] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_range(self):
        if self.end < self.start:
            raise ValueError("end must be greater than or equal to start")

        if self.end - self.start > 99:
            raise ValueError("You cannot create more than 100 classes at once")

        return self


class CreateSchoolClassRequest(BaseRequest):
    name: str
    level: int
    capacity: int
    sections: list[SectionRequest] = Field(default_factory=list)