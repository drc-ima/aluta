from shared.data.models import ClassroomCourseStaff
from shared.data.repositories.repository import BaseRepository
from shared.data.schemas.domain import ClassroomCourseStaffDomain


class ClassroomCourseStaffRepository(BaseRepository[ClassroomCourseStaff, ClassroomCourseStaffDomain]):
    model = ClassroomCourseStaff