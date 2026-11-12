from shared.data.models import ClassroomStaffAssignment
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import ClassroomStaffAssignmentDomain


class ClassroomStaffAssignmentRepository(BaseRepository[ClassroomStaffAssignment, ClassroomStaffAssignmentDomain]):
    model = ClassroomStaffAssignment