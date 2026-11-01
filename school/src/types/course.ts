import type { DepartmentT, SchoolT } from "./staff"

export type CourseT = {
    school_id: string
    school: SchoolT
    id: string
    is_active: boolean
    name: string
    description: string | null
    department_id: string
    department: DepartmentT
    code: string
}