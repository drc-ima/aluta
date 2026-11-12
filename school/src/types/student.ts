import type { MediaT } from "./media"
import type { ClassroomCourseStaffT, ClassroomT } from "./schoolClass"
import type { CampusT, SchoolT } from "./staff"


export type StudentT = {
    id: string
    first_name: string
    middle_name: string
    last_name: string
    full_name: string
    media: MediaT[]
    date_of_birth: Date
    gender: string
    admission_number: string
    admission_date: Date
    school_id: string
    campus_id: string
    campus: CampusT
    school: SchoolT
    classroom?: EnrollmentT
    enrollments: EnrollmentT[]
}

export type EnrollmentT = {
    id: string
    student_id: string
    classroom_id: string
    classroom: ClassroomT
    enrolled_at: Date
    left_at: Date
    student: StudentT
    courses: EnrollmentCourseT[]
}

export type EnrollmentCourseT = {
    id: string
    enrollment_id: string
    course_id: string
    enrollment: EnrollmentT
    course: ClassroomCourseStaffT
}

export enum GuardianRelationshipType {
    Father = "Father",
    Mother = "Mother",
    Sister = "Sister",
    Brother = "Brother",
    Cousin = "Cousin",
    Aunty = "Aunty",
    Uncle = "Uncle",
    DistanceRelative = "Distant Relative",
    FamilyFriend = "Family Friend"
}

export type EnrollStudentPayload = {
    classroom_id: string
    student_id: string
    enrolled_at: Date
} & BodyInit