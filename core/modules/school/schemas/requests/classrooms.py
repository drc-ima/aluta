

import uuid

from pydantic import Field

from shared.data.schemas.requests.base_request import BaseRequest


class CreateClassroomRequest(BaseRequest):
    school_class_id: uuid.UUID


class BulkCreateClassroomsRequest(BaseRequest):
    classrooms: list[CreateClassroomRequest] = Field(default_factory=list)


class AssignClassroomCourseStaffRequest(BaseRequest):
    classroom_id: uuid.UUID
    staff_id: uuid.UUID
    course_id: uuid.UUID


class AssignClassroomStaffRequest(BaseRequest):
    classroom_id: uuid.UUID
    staff_id: uuid.UUID
    head: bool = False