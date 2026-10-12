from datetime import datetime
from enum import Enum
from typing import Optional, Any

from uuid import UUID
import uuid

from pydantic import BaseModel, ConfigDict, Field

class AuditSchemaMixin:
    
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None


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


class UserDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    user_type: UserType
    is_active: bool = False
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    username: str
    user_roles: list["UserRoleDomain"] = Field(default_factory=list)
    user_permissions: list["UserPermissionDomain"] = Field(
        default_factory=list
    )
    staffs: list["StaffDomain"] = Field(default_factory=list)

    def full_name(self):
        return f"{self.first_name}{' ' + self.middle_name + ' ' if self.middle_name else ' '}{self.last_name}"
    

class RoleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    default: bool
    school_id: Optional[uuid.UUID] = None
    school: Optional[Any] = None
    created_by: Optional[UserDomain] = None
    updated_by: Optional[UserDomain] = None
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
    module: Optional["ModuleDomain"]
    # role_permissions: list["RolePermissionDomain"] = []
    # user_permissions: list["UserPermissionDomain"] = []

    @property
    def permission(self) -> str:
        return self.code_name + "-" + self.module.name

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
    domain: Optional[str] = None
    business_email: str
    website: Optional[str] = None
    slug: Optional[str] = None
    # created_by: Optional[UserDomain] = None
    # updated_by: Optional[UserDomain] = None
    roles: list[RoleDomain] = Field(default_factory=list)
    positions: list["PositionDomain"] = Field(default_factory=list)
    staffs: list["StaffDomain"] = Field(default_factory=list)
    departments: list["DepartmentDomain"] = Field(default_factory=list)
    modules: list["SchoolModuleDomain"] = Field(default_factory=list)


class CampusDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    gps_code: Optional[str] = None
    address: Optional[str] = None
    is_main: Optional[bool] = None
    school_id: Optional[uuid.UUID] = None
    # school: Optional[SchoolDomain] = None
    # created_by: Optional[UserDomain] = None
    # updated_by: Optional[UserDomain] = None


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

    # user: Optional[UserDomain] = None
    # school: Optional[SchoolDomain] = None
    parent: Optional["StaffDomain"] = None
    children: list["StaffDomain"] = Field(default_factory=list)
    staff_positions: list["StaffPositionDomain"] = Field(default_factory=list)
    campuses: list["StaffCampusDomain"] = Field(default_factory=list)
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

    # school: Optional[SchoolDomain] = None


class StaffPositionDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    position_id: uuid.UUID
    start_date: datetime
    end_date: datetime

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

    school: Optional[SchoolDomain] = None

class StaffDepartmentDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    staff_id: uuid.UUID
    department_id: uuid.UUID
    ordinal: int

    # staff: Optional[StaffDomain] = None
    department: Optional[DepartmentDomain] = None

class ModuleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class SchoolModuleDomain(AuditSchemaMixin, BaseModel):
    model_config = ConfigDict(from_attributes=True)

    module_id: uuid.UUID
    school_id: uuid.UUID
    module: Optional[ModuleDomain] = None


