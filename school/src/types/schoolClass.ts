import type { AcademicPeriodT } from "./academicPeriod"

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


export type ClassroomPayload = {
    classrooms: {
        school_class_id: string
    }[]
    
} & BodyInit


export type ClassroomT = {
    academic_period: AcademicPeriodT
    school_class: SchoolClassT
    id: string
    academic_period_id: string
    school_class_id: string
}