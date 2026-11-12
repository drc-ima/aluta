import type { AcademicPeriodT } from "./academicPeriod"
import type { CourseT } from "./course"
import type { StaffT } from "./staff"
import type { EnrollmentT, StudentT } from "./student"

export type SchoolClassT = {
    active: boolean
    campus_id: string
    capacity: number | null
    code: string
    created_at: Date
    description: string
    id: string
    level: string
    name: string
    section: string
}

export type RangeSchoolClassPayload = {
    prefix: string
    start: number
    end: number
    capcity: number
    sections: {
        name: string
    }[]
} & BodyInit

export type SchoolClassPayload = {
    name: string
    level: number
    capacity: number
    sections: {
        name: string
    }[]
} & BodyInit


export type ClassroomPayload = {
    classrooms: {
        school_class_id: string
    }[]
    
} & BodyInit


export type ClassroomCourseStaffT = {
    id: string
    classroom_id: string
    course_id: string
    staff_id: string
    course: CourseT
    classroom: ClassroomT
    staff: StaffT
    enrollments: EnrollmentT[]
}

export type ClassroomStaffAssignmentT = {
    id: string
    classroom_id: string
    staff_id: string
    head: boolean
    academic_period_id: string
    classroom: ClassroomT
    staff: StaffT
    academic_period: AcademicPeriodT
}

export type ClassroomT = {
    academic_period: AcademicPeriodT
    school_class: SchoolClassT
    id: string
    academic_period_id: string
    school_class_id: string
    staff_assignments: ClassroomStaffAssignmentT[]
    courses: ClassroomCourseStaffT[]
    courses_count: number
    enrollments: EnrollmentT[]
    students: StudentT[]
    enrollments_count: number
    previous_id: string | null | undefined
    next_id: string | null | undefined
    sections: ClassroomT[]
}

export type ClassroomCourseStaffPayload = {
    classroom_id: string
    course_id: string
    staff_id: string
} & BodyInit