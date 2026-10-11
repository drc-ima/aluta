from pydantic import BaseModel, ConfigDict

class BaseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    def model_dump(self, exclude_unset: bool = False) -> dict:
        return super().model_dump(exclude_unset=exclude_unset)