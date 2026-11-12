from datetime import date, datetime
from encodings.punycode import T
from enum import Enum
import json
from typing import Callable, Iterable, Optional, Any

import uuid

from pydantic import BaseModel, ConfigDict, Field

def build_tree(
    items: list[T],
    *,
    get_id: Callable[[T], Any] = lambda item: item.id,
    get_parent_id: Callable[[T], Any] = lambda item: item.parent_id,
) -> list[dict[str, Any]]:
    items_by_parent: dict[Any, list[T]] = {}

    for item in items:
        parent_id = get_parent_id(item)
        items_by_parent.setdefault(parent_id, []).append(item.to_pydantic())
        
        

    def build_node(item: T) -> dict[str, Any]:
        if hasattr(item, "model_dump"):
            node = item.model_dump(exclude={"children"})
        elif hasattr(item, "__mapper__"):
            node = {
                column.key: getattr(item, column.key)
                for column in item.__mapper__.column_attrs
            }
        else:
            node = vars(item).copy()
        
        node["children"] = [
            build_node(child)
            for child in items_by_parent.get(get_id(item), [])
        ]

        return node

    return [
        build_node(item)
        for item in items_by_parent.get(None, [])
    ]

class AuditSchemaMixin:
    
    id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by_id: Optional[uuid.UUID] = None
    updated_by_id: Optional[uuid.UUID] = None


class UserType(str, Enum):
    ADMIN = "ADMINISTRATOR"
    SCHOOL = "SCHOOL"
    GARDIAN = "GARDIAN"
    STUDENT = "STUDENT"

class EMPLOYMENT_TYPE(str, Enum):
    FULL_TIME = "Full Time"
    PART_TIME = "Part time"
    CONTRACTOR = "Contractor"
    DISMISSED = "Dismissed"
    RESIGNED = "Resigned"


class UserInputDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    user_type: UserType
    verified: bool
    is_active: bool = False
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    username: str
    user_roles: list["UserRoleDomain"] = Field(default_factory=list)
    user_permissions: list["UserPermissionDomain"] = Field(
        default_factory=list
    )
    # staffs: list["StaffDomain"] = Field(default_factory=list)
    defaults: list["UserDefaultModuleDomain"] = Field(default_factory=list)

    @property
    def full_name(self) -> str:
        return f"{self.first_name}{' ' + self.middle_name + ' ' if self.middle_name else ' '}{self.last_name}"


class UserDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    user_type: UserType
    verified: bool
    is_active: bool = False
    email: Optional[str] = None
    phone: Optional[str] = None
    # password: Optional[str] = None
    username: str
    user_roles: list["UserRoleDomain"] = Field(default_factory=list)
    user_permissions: list["UserPermissionDomain"] = Field(
        default_factory=list
    )
    # staffs: list["StaffDomain"] = Field(default_factory=list)
    defaults: list["UserDefaultModuleDomain"] = Field(default_factory=list)

    full_name: Optional[str] = None

class RoleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    default: bool
    school_id: Optional[uuid.UUID] = None
    # school: Optional["SchoolDomain"] = None
    # created_by: Optional[UserDomain] = None
    # updated_by: Optional[UserDomain] = None
    role_permissions: list["RolePermissionDomain"] = Field(default_factory=list)
    # user_permissions: list["UserRoleDomain"] = Field(default_factory=list)

class UserRoleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    role_id: uuid.UUID
    role: Optional["RoleDomain"] = None
    # user: Optional[UserDomain] = None

    
class PermissionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code_name: str
    description: Optional[str]
    module_id: uuid.UUID
    # module: Optional["ModuleDomain"]
    # role_permissions: list["RolePermissionDomain"] = []
    # user_permissions: list["UserPermissionDomain"] = []

class RolePermissionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role_id: uuid.UUID
    permission_id: uuid.UUID
    # role: Optional[RoleDomain] = None
    permission: Optional[PermissionDomain] = None


class UserPermissionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    permission_id: uuid.UUID
    # user: Optional[UserDomain] = None
    permission: Optional[PermissionDomain] = None


class SchoolDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: Optional[str] = None
    active: Optional[bool] = None
    verified: bool
    domain: Optional[str] = None
    business_email: str
    website: Optional[str] = None
    slug: Optional[str] = None

    roles: list[RoleDomain] = Field(default_factory=list)
    positions: list["PositionDomain"] = Field(default_factory=list)
    staffs: list["StaffDomain"] = Field(default_factory=list)
    departments: list["DepartmentDomain"] = Field(default_factory=list)
    modules: list["SchoolModuleDomain"] = Field(default_factory=list)
    campuses: list["CampusDomain"] = Field(default_factory=list)


class CampusDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    gps_code: Optional[str] = None
    address: Optional[str] = None
    is_main: Optional[bool] = None
    school_id: Optional[uuid.UUID] = None

    academic_periods: list["AcademicPeriodDomain"]
    # school: Optional[SchoolDomain] = None
    # created_by: Optional[UserDomain] = None
    # updated_by: Optional[UserDomain] = None

    @property
    def address(self) -> dict | None:
        if not self.address:
            return None
        try:
            return json.loads(self.address)
        except:
            return None


class ContactType(str, Enum):
    EMAIL = "EMAIL"
    PHONE = "PHONE"

class CampusContactDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    campus_id: uuid.UUID 
    contact_type: Optional[ContactType] = None
    contact: Optional[str] = None
    # campus: Optional[CampusDomain] = None
    created_by: Optional[UserDomain] = None
    updated_by: Optional[UserDomain] = None


class StaffDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    staff_no: str
    school_id: uuid.UUID
    active: Optional[bool] = False
    parent_id: Optional[uuid.UUID] = None
    employment_date: Optional[datetime] = None

    user: Optional[UserDomain] = None
    # school: Optional[SchoolDomain] = None
    parent: Optional["StaffDomain"] = None
    # children: list["StaffDomain"] = Field(default_factory=list)
    staff_positions: list["StaffPositionDomain"] = Field(default_factory=list)
    staff_campuses: list["StaffCampusDomain"] = Field(default_factory=list)
    staff_departments: list["StaffDepartmentDomain"] = Field(default_factory=list)


class StaffContactDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    contact_type: ContactType
    contact: str


class PositionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    default: bool
    school_id: uuid.UUID
    name: str
    description: Optional[str] = None
    employment_type: EMPLOYMENT_TYPE
    rank: Optional[str] = None
    # staff_positions: list["StaffPositionDomain"] = Field(default_factory=list)

    # school: Optional[SchoolDomain] = None


class StaffPositionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    position_id: uuid.UUID
    start_date: datetime
    end_date: Optional[datetime] = None

    # staff: Optional[StaffDomain] = None
    position: Optional[PositionDomain] = None


class StaffCampusDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    campus_id: uuid.UUID

    campus: Optional[CampusDomain] = None
    # staff: Optional[StaffDomain] = None


class DepartmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    school_id: uuid.UUID
    name: str
    description: Optional[str] = None

    # school: Optional[SchoolDomain] = None

class StaffDepartmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    department_id: uuid.UUID
    # ordinal: int

    # staff: Optional[StaffDomain] = None
    department: Optional[DepartmentDomain] = None

class ModuleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    default: Optional[bool] = False
    slug: Optional[str] = None
    permissions: list[PermissionDomain] = Field(default_factory=list)


class SchoolModuleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    module_id: uuid.UUID
    school_id: uuid.UUID
    module: Optional[ModuleDomain] = None


class AcademicPeriodDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    school_id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    parent_id: Optional[uuid.UUID] = None
    campus_id: Optional[uuid.UUID] = None
    days: Optional[int] = 1
    weeks: Optional[int] = 1
    parent: Optional["AcademicPeriodDomain"] = None
    today_year: Optional[bool] = False
    today_term: Optional[bool] = False
    # children: list["AcademicPeriodDomain"] = Field(default_factory=list)

class UserDefaultModuleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: uuid.UUID
    module_id: uuid.UUID
    user_id: uuid.UUID

    module: Optional[ModuleDomain] = None

class MediaDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entity_id: uuid.UUID
    blob_url: str
    media_type: str
    metadatas: Optional[str] = None


class CourseDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    department_id: Optional[uuid.UUID] = None
    school_id: uuid.UUID
    # classrooms: list["ClassroomCourseStaffDomain"] = Field(default_factory=list)
    department: Optional[DepartmentDomain] = None


class ClassroomCourseStaffDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)
    classroom_id: uuid.UUID
    course_id: uuid.UUID
    staff_id: uuid.UUID
    academic_period_id: uuid.UUID
    course: Optional[CourseDomain] = None
    staff: Optional[StaffDomain] = None
    enrollments: list["EnrollmentCourseDomain"] = Field(default_factory=list)
    # classroom: Optional["ClassroomDomain"] = None


class SchoolClassDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)
    school_id: uuid.UUID
    campus_id: uuid.UUID
    name: str
    code: str
    level: int
    section: Optional[str] = None
    capacity: Optional[int] = None
    active: bool


class ClassroomStaffAssignmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)
    classroom_id: uuid.UUID
    staff_id: uuid.UUID
    head: bool

    staff: Optional[StaffDomain] = None

class StudentGender(str, Enum):
    Male = "MALE"
    Female = "FEMALE"


class StudentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    full_name: Optional[str] = None
    date_of_birth: date
    age: Optional[int] = None
    gender: StudentGender
    admission_date: Optional[date] = None
    admission_number: str
    
    school_id: uuid.UUID
    campus_id: Optional[uuid.UUID] = None
    
    campus: Optional["CampusDomain"] = None
    school: Optional["SchoolDomain"] = None

    media: list[MediaDomain] = Field(default_factory=list)
    
    # guardians: list["StudentGuardianDomain"] = Field(default_factory=list)
    
    enrollments: list["EnrollmentDomain"] = Field(default_factory=list)


class GuardianDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    school_id: uuid.UUID

    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    school: Optional["SchoolDomain"] = None
    # students: list["StudentGuardianDomain"] = Field(default_factory=list)


class StudentGuardianDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: uuid.UUID
    guardian_id: Optional[uuid.UUID] = None

    relationship_type: str
    is_primary_contact: bool = False
    can_collect: bool = False
    receives_updates: bool = True

    student: Optional["StudentDomain"] = None
    guardian: Optional["GuardianDomain"] = None


class ClassroomDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    school_class_id: uuid.UUID
    academic_period_id: uuid.UUID

    academic_period: Optional["AcademicPeriodDomain"] = None
    school_class: Optional[SchoolClassDomain] = None
    staff_assignments: list[ClassroomStaffAssignmentDomain] = Field(default_factory=list)
    courses_count: Optional[int] = None
    enrollments_count: Optional[int] = None

class EnrollmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: uuid.UUID
    classroom_id: uuid.UUID

    enrolled_at: date
    left_at: Optional[date] = None

    # student: Optional["StudentDomain"] = None
    classroom: Optional["ClassroomDomain"] = None
    # statuses: list["EnrollmentStatusDomain"] = Field(default_factory=list)


class EnrollmentStatusDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enrollment_id: uuid.UUID
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    enrollment: Optional[EnrollmentDomain] = None


class EnrollmentCourseDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enrollment_id: uuid.UUID
    course_id: uuid.UUID
    total_scores: Optional[float] = None
    assessment_count: Optional[int] = None


class AssessmentType(str, Enum):
    EXAMINATION = "Examination"
    MID_PERIOD = "Mid-Period"
    QUIZ = "Quiz"


class EnrollmentCourseAssessmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    enrollment_course_id: uuid.UUID
    assessment_type: AssessmentType
    earned_score: float
    max_score: float
    remarks: Optional[str] = None
    enrollment_course: Optional[EnrollmentCourseDomain] = None