from datetime import datetime, timezone
import uuid
from middlewares.context.password import pwd_context
from sqlalchemy import UUID, Boolean, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, func, text
from sqlalchemy.orm import mapped_column, relationship, Mapped, declared_attr, deferred, configure_mappers
from shared.data.schemas.domain import (
    EMPLOYMENT_TYPE,
    AcademicPeriodDomain,
    CampusContactDomain,
    CampusDomain,
    ContactType,
    DepartmentDomain,
    PermissionDomain,
    PhotoDomain,
    PositionDomain,
    RoleDomain,
    RolePermissionDomain,
    SchoolDomain,
    StaffCampusDomain,
    StaffContactDomain,
    StaffDepartmentDomain,
    StaffDomain,
    StaffPositionDomain,
    UserDefaultModuleDomain,
    UserPermissionDomain,
    UserRoleDomain,
    UserType,
    UserDomain,
    ModuleDomain,
    SchoolModuleDomain
)
from shared.data.session import Base

configure_mappers()


class AuditMixin:

    @declared_attr
    def id(cls) -> Mapped[uuid.UUID]: 
        return mapped_column(UUID, primary_key=True, index=True, server_default=text("gen_random_uuid()"))
    
    @declared_attr
    def created_at(cls) -> Mapped[datetime]: 
        return mapped_column(
            DateTime,
            default=lambda: datetime.now(timezone.utc),
            server_default=func.now()
        )

    @declared_attr
    def updated_at(cls) -> Mapped[datetime]: 
        return mapped_column(
            DateTime,
            default=lambda: datetime.now(timezone.utc),
            server_default=func.now()
        )

    @declared_attr
    def created_by_id(cls) -> Mapped[uuid.UUID]: 
        return mapped_column(
            UUID, ForeignKey("user.id", ondelete="SET NULL"), nullable=True
        )

    @declared_attr
    def created_by(cls) -> Mapped["User"]: 
        return relationship("User", foreign_keys=f"[{cls.__name__}.created_by_id]")
    
    @declared_attr
    def updated_by_id(cls) -> Mapped[uuid.UUID]: 
        return mapped_column(
            UUID, ForeignKey("user.id", ondelete="SET NULL"), nullable=True
        )

    @declared_attr
    def updated_by(cls) -> Mapped["User"]: 
        return relationship("User", foreign_keys=f"[{cls.__name__}.updated_by_id]")

class User(AuditMixin, Base):
    __tablename__ = "user"
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    middle_name: Mapped[str] = mapped_column(String, nullable=True)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    user_type: Mapped[UserType] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    email: Mapped[str] = mapped_column(String, nullable=True)
    phone: Mapped[str] = deferred(mapped_column(String, nullable=True))
    username: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    user_permissions: Mapped[list["UserPermission"]] = relationship(
        back_populates="user",
        foreign_keys="[UserPermission.user_id]"
    )
    user_roles: Mapped[list["UserRole"]] = relationship(
        back_populates="user",
        foreign_keys="[UserRole.user_id]"
    )
    staffs: Mapped[list["Staff"]] = relationship(back_populates="user", foreign_keys="[Staff.user_id]")
    defaults: Mapped[list["UserDefaultModule"]] = relationship(back_populates="user", foreign_keys="[UserDefaultModule.user_id]")

    def set_password(self, raw_password: str) -> None:
        self.password = pwd_context.hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        """Verifies if the provided plain password matches the stored hash."""
        if not self.password:
            return False
        return pwd_context.verify(raw_password, self.password)

    @property
    def full_name(self) -> str:
        return f"{self.first_name}{" "+ self.middle_name if self.middle_name else ""}{" " + self.last_name}"
    
    def to_pydantic(self):
        return UserDomain.model_validate(self)


class Role(AuditMixin, Base):
    __tablename__ = "role"
    name: Mapped[str] = mapped_column(String, nullable=False)
    default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"), nullable=True)
    school: Mapped["School"] = relationship(back_populates="roles")
    role_permissions: Mapped[list["RolePermission"]] = relationship(
        back_populates="role",
        foreign_keys="[RolePermission.role_id]"
    )
    user_roles: Mapped[list["UserRole"]] = relationship(
        back_populates="role",
        foreign_keys="[UserRole.role_id]"
    )
    
    def to_pydantic(self):
        return RoleDomain.model_validate(self)


class UserRole(AuditMixin, Base):
    __tablename__ = "user_role"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("role.id", ondelete="CASCADE"), nullable=False)
    user: Mapped["User"] = relationship(
        back_populates="user_roles",
        foreign_keys="[UserRole.user_id]"
    )
    role: Mapped["Role"] = relationship(
        back_populates="user_roles",
        foreign_keys="[UserRole.role_id]"
    )

    def to_pydantic(self):
        return UserRoleDomain.model_validate(self)

class Permission(AuditMixin, Base):
    __tablename__ = "permission"

    code_name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    module_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("module.id", ondelete="CASCADE"))
    module: Mapped["Module"] = relationship(back_populates="permissions", foreign_keys="[Permission.module_id]")
    role_permissions: Mapped[list["RolePermission"]] = relationship(
        back_populates="permission",
        foreign_keys="[RolePermission.permission_id]"
    )
    user_permissions: Mapped[list["UserPermission"]] = relationship(
        back_populates="permission",
        foreign_keys="[UserPermission.permission_id]"
    )

    @property
    def permission(self) -> str:
        return self.code_name + "-" + self.module

    def to_pydantic(self):
        return PermissionDomain.model_validate(self)


class RolePermission(AuditMixin, Base):
    __tablename__ = "role_permission"

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("role.id", ondelete="CASCADE"), nullable=False)
    permission_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("permission.id", ondelete="CASCADE"), nullable=False)
    role: Mapped["Role"] = relationship(
        back_populates="role_permissions",
        # foreign_keys="[Role.role_id]"
    )
    permission: Mapped["Permission"] = relationship(back_populates="role_permissions")

    def to_pydantic(self):
        return RolePermissionDomain.model_validate(self)


class UserPermission(AuditMixin, Base):
    __tablename__ = "user_permission"
    __table_args__ = (
        UniqueConstraint("user_id", "permission_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    permission_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("permission.id", ondelete="SET NULL"), nullable=False)
    user: Mapped["User"] = relationship(
        back_populates="user_permissions",
        foreign_keys="[UserPermission.user_id]"
    )
    permission: Mapped["Permission"] = relationship(
        back_populates="user_permissions",
        foreign_keys="[UserPermission.permission_id]"
    )

    def to_pydantic(self):
        return UserPermissionDomain.model_validate(self)


class School(AuditMixin, Base):
    __tablename__ = "school"

    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    active: Mapped[bool] = mapped_column(Boolean)
    domain: Mapped[str] = mapped_column(String)
    business_email: Mapped[str] = mapped_column(String, unique=True)
    slug: Mapped[str] = mapped_column(String, nullable=True)
    website: Mapped[str] = mapped_column(String, nullable=True)

    roles: Mapped[list[Role]] = relationship(back_populates="school", foreign_keys="[Role.school_id]")
    staffs: Mapped[list["Staff"]] = relationship(back_populates="school", foreign_keys="[Staff.school_id]")
    positions: Mapped[list["Position"]] = relationship(back_populates="school", foreign_keys="[Position.school_id]")
    departments: Mapped[list["Department"]] = relationship(back_populates="school", foreign_keys="[Department.school_id]")
    modules: Mapped[list["SchoolModule"]] = relationship(back_populates="school", foreign_keys="[SchoolModule.school_id]")
    campuses: Mapped[list["Campus"]] = relationship(back_populates="school", foreign_keys="[Campus.school_id]")
    def to_pydantic(self):
        return SchoolDomain.model_validate(self)


class Campus(AuditMixin, Base):
    __tablename__ = "campus"

    name: Mapped[str] = mapped_column(String, nullable=False)
    gps_code: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=True)
    is_main: Mapped[bool] = mapped_column(Boolean)
    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"), nullable=False, index=True)

    academic_periods: Mapped[list["AcademicPeriod"]] = relationship(back_populates="campus", foreign_keys="[AcademicPeriod.campus_id]")
    contacts: Mapped[list["CampusContact"]] = relationship(back_populates="campus", foreign_keys="[CampusContact.campus_id]")
    staffs: Mapped[list["StaffCampus"]] = relationship(back_populates="campus", foreign_keys="[StaffCampus.campus_id]")
    school: Mapped[School] = relationship(back_populates="campuses", foreign_keys="[Campus.school_id]")
    def to_pydantic(self):
        return CampusDomain.model_validate(self)


class CampusContact(AuditMixin, Base):
    __tablename__ = "campus_contact"

    campus_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("campus.id", ondelete="CASCADE"), nullable=False)
    contact_type: Mapped[ContactType] = mapped_column(String, nullable=False)
    contact: Mapped[str] = mapped_column(String, nullable=False)

    campus: Mapped[Campus] = relationship(back_populates="contacts")
    
    def to_pydantic(self):
        return CampusContactDomain.model_validate(self)


class Staff(AuditMixin, Base):
    __tablename__ = "staff"
    __tabe_args__ = (
        UniqueConstraint("school_id", "staff_no"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    staff_no: Mapped[str] = mapped_column(String, nullable=False)
    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"))
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    
    user: Mapped[User] = relationship(back_populates="staffs", foreign_keys="[Staff.user_id]")
    school: Mapped[School] = relationship(back_populates="staffs", foreign_keys="[Staff.school_id]")
    parent: Mapped["AcademicPeriod"] = relationship(
        "Staff",
        back_populates="children",
        remote_side="Staff.id",
        foreign_keys="[Staff.parent_id]"
    )
    children: Mapped[list["Staff"]] = relationship(
        "Staff",
        back_populates="parent",
        foreign_keys=[parent_id],
        passive_deletes=True,
    )
    staff_positions: Mapped[list["StaffPosition"]] = relationship(back_populates="staff", foreign_keys="[StaffPosition.staff_id]")
    staff_campuses: Mapped[list["StaffCampus"]] = relationship(back_populates="staff", foreign_keys="[StaffCampus.staff_id]")
    staff_departments: Mapped[list["StaffDepartment"]] = relationship(back_populates="staff", foreign_keys="[StaffDepartment.staff_id]")

    def to_pydantic(self):
        return StaffDomain.model_validate(self)


class StaffContact(AuditMixin, Base):
    __tablename__ = "staff_contact"

    staff_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("staff.id", ondelete="CASCADE"))
    contact_type: Mapped[ContactType] = mapped_column(String)
    contact: Mapped[str] = mapped_column(String)

    def to_pydantic(self):
        return StaffContactDomain.model_validate(self)


class Position(AuditMixin, Base):
    __tablename__ = "position"

    default: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    employement_type: Mapped[EMPLOYMENT_TYPE] = mapped_column(String)

    school: Mapped[School] = relationship(back_populates="positions", foreign_keys="[Position.school_id]")
    staff_positions: Mapped[list["StaffPosition"]] = relationship(back_populates="position", foreign_keys="[StaffPosition.position_id]")
    
    def to_pydantic(self):
        return PositionDomain.model_validate(self)


class StaffPosition(AuditMixin, Base):
    __tablename__ = "staff_position"

    staff_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("staff.id", ondelete="CASCADE"))
    position_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("position.id", ondelete="CASCADE"))
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    staff: Mapped[Staff] = relationship(back_populates="staff_positions")
    position: Mapped[Position] = relationship(back_populates="staff_positions")

    def to_pydantic(self):
        return StaffPositionDomain.model_validate(self)


class StaffCampus(AuditMixin, Base):
    __tablename__ = "staff_campus"

    staff_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("staff.id", ondelete="CASCADE"))
    campus_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("campus.id", ondelete="CASCADE"), nullable=False)

    campus: Mapped[Campus] = relationship(back_populates="staffs")
    staff: Mapped[Staff] = relationship(back_populates="staff_campuses")

    def to_pydantic(self):
        return StaffCampusDomain.model_validate(self)


class Department(AuditMixin, Base):
    __tablename__ = "department"

    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)

    school: Mapped[School] = relationship(back_populates="departments", foreign_keys="[Department.school_id]")
    department_staffs: Mapped[list["StaffDepartment"]] = relationship(back_populates="department", foreign_keys="[StaffDepartment.department_id]")

    def to_pydantic(self):
        return DepartmentDomain.model_validate(self)


class StaffDepartment(AuditMixin, Base):
    __tablename__ = "staff_department"

    department_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("department.id", ondelete="CASCADE"))
    staff_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("staff.id", ondelete="CASCADE"))
    ordinal: Mapped[int] = mapped_column(Integer)

    staff: Mapped[Staff] = relationship(back_populates="staff_departments")
    department: Mapped[Department] = relationship(back_populates="department_staffs")

    def to_pydantic(self):
        return StaffDepartmentDomain.model_validate(self)


class Module(AuditMixin, Base):
    __tablename__ = "module"

    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), nullable=True)
    default: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    slug: Mapped[str] = mapped_column(String, nullable=True)

    school_modules: Mapped[list["SchoolModule"]] = relationship(back_populates="module", foreign_keys="[SchoolModule.module_id]")
    permissions: Mapped[list[Permission]] = relationship(back_populates="module", foreign_keys="[Permission.module_id]")
    user_default_modules: Mapped[list["UserDefaultModule"]] = relationship(back_populates="module", foreign_keys="[UserDefaultModule.module_id]")
    
    def to_pydantic(self):
        return ModuleDomain.model_validate(self)


class SchoolModule(AuditMixin, Base):
    __tablename__ = "school_module"

    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"))
    module_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("module.id", ondelete="CASCADE"))
    school: Mapped[School] = relationship(back_populates="modules", foreign_keys="[SchoolModule.school_id]")
    module: Mapped[Module] = relationship(back_populates="school_modules", foreign_keys="[SchoolModule.module_id]")
    def to_pydantic(self):
        return SchoolModuleDomain.model_validate(self)


class AcademicPeriod(AuditMixin, Base):
    __tablename__ = "academic_period"

    school_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("school.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, index=True)
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("academic_period.id", ondelete="SET NULL"), nullable=True)
    campus_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("campus.id", ondelete="SET NULL"), nullable=True)

    campus: Mapped[Campus] = relationship(back_populates="academic_periods", foreign_keys="[AcademicPeriod.campus_id]")
    parent: Mapped["AcademicPeriod"] = relationship(
        "AcademicPeriod",
        back_populates="children",
        remote_side="AcademicPeriod.id",
        foreign_keys="[AcademicPeriod.parent_id]"
    )
    children: Mapped[list["AcademicPeriod"]] = relationship(
        "AcademicPeriod",
        back_populates="parent",
        foreign_keys=[parent_id],
        passive_deletes=True,
    )

    def to_pydantic(self):
        return AcademicPeriodDomain.model_validate(self)

class UserDefaultModule(AuditMixin, Base):
    __tablename__ = "user_default_module"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    module_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("module.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("user.id", ondelete="CASCADE"))

    user: Mapped[User] = relationship(back_populates="defaults", foreign_keys="[UserDefaultModule.user_id]")
    module: Mapped[Module] = relationship(back_populates="user_default_modules", foreign_keys="[UserDefaultModule.module_id]")
    
    def to_pydantic(self):
        return UserDefaultModuleDomain.model_validate(self)

class Photo(AuditMixin, Base):
    __tablename__ = "photo"

    entity_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    blob_url: Mapped[str] = mapped_column(String, nullable=False)
    metadata: Mapped[str] = mapped_column(String, nullable=True)

    def to_pydantic(self):
        return PhotoDomain.mode_validate(self)