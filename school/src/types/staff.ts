
export type StaffT = {
    id: string
    user_id: string
    staff_no: string
    active: boolean
    parent: StaffT | null
    photosUrl?: string | null
    user: UserT
    staff_campuses: StaffCampusT[]
    school_id: string
    school: SchoolT
    staff_departments: StaffDepartmentT[]
    staff_positions: StaffPositionT[]
}

export type UserT = {
    first_name: string
    last_name: string
    middle_name?: string
    email: string
    phone: string
    is_active: boolean
    verified: boolean
    username: string
    user_type: string
}

export type StaffCampusT = {
    staff_id: string
    campus_id: string
    id: string
    staff: StaffT
    campus: CampusT
}

export type CampusT = {
    address: string
    gps_code: string
    id: string
    name: string
    school: SchoolT
    school_id: string
}

export type SchoolT = {
    id: string
    name: string
    active: string
    verified: string
    domain: string
    business_email: string
    website: string
    slug: string
    staffs: StaffT[]
    roles: RoleT[]
    campuses: CampusT[]
    modules: SchoolModuleT[]
    departments: DepartmentT[]
    positions: PositionT[]
}

export type PositionT = {
    id: string
    default: boolean
    school_id: string
    name: string
    description: string | null
    employment_type: string
    rank: string
}

export type StaffPositionT = {
    id: string
    position: PositionT
    staff_id: string
    start_date: Date
    end_date: Date | null
}

export type UserRoleT = {
    id: string
    user_id: string
    role_id: string
    role: RoleT
}

export type RoleT = {
    id: string
    name: string
    school_id: string
    default: boolean
    role_permissions: RolePermissionT[]
}

export type RolePermissionT = {
    id: string
    role_id: string
    permission_id: string
    permission: PermissionT
}

export type PermissionT = {
    code_name: string
    description: string | null
    module_id: string
    id: string
}

export type StaffDepartmentT = {
    id: string
    department_id: string
    staff_id: string
    department: DepartmentT
}

export type DepartmentT = {
    id: string
    name: string
    school_id: string
    description: string
}


export type ModuleT = {
    id: string
    name: string
    description: string
    icon: string
    default: boolean
    slug: string
}

export type SchoolModuleT = {
    id: string
    module_id: string
    school_id: string
    module: ModuleT
}

// export type CampusT = {
//     id: string
//     name: string
//     gps_code: string
//     address: string
//     is_main: boolean
//     school_id: string
//     academic_periods: any[]
// }