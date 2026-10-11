from fastapi import HTTPException, status


class RecordAlreadyExistsException(HTTPException):

    def __init__(self, record_type: str, identifier: str):
        self.record_type = record_type
        self.identifier = identifier
        detail = f"{record_type} with name '{identifier}' already exists.Please choose a different name."

        super().__init__(status_code=status.HTTP_409_CONFLICT,detail=detail)


class RecordNotFoundException(HTTPException):

    def __init__(self, record_type: str, identifier: str):
        self.record_type = record_type
        self.identifier = identifier
        detail = f"{record_type} with name '{identifier}' does not exists.Please choose a different name."

        super().__init__(status_code=status.HTTP_404_NOT_FOUND,detail=detail)