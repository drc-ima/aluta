import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";
import type { ClassroomCourseStaffPayload, ClassroomPayload, ClassroomT } from "@/types/schoolClass";
import type { ClassroomStaffPayload } from "@/types/staff";
import type { EnrollStudentPayload } from "@/types/student";


export function createBulkClassroomsApi(
    fetchInstance: FetchInstance,
    school_id: string,
    academic_period_id: string,
    payload: ClassroomPayload
) {
    return fetchInstance(
        API_ENDPOINTS.CREATE_BULK_CLASSROOMS(school_id, academic_period_id),
        {
            method: "POST",
            body: payload
        }
    )
}

export function classroomsApi(
    fetchInstance: FetchInstance,
    school_id: string,
    academic_period_id: string,
) {
    return fetchInstance<ClassroomT[]>(
        API_ENDPOINTS.FETCH_CLASSROOMS(school_id, academic_period_id),
        {
            method: "GET",
        }
    )
}

export function classroomDetailsApi (
    fetchInstance: FetchInstance,
    school_id: string,
    academic_period_id: string,
    classroom_id: string
) {
    return fetchInstance<ClassroomT | null>(
        API_ENDPOINTS.FETCH_CLASSROOM(school_id, academic_period_id, classroom_id)
    )
}

export function createClassroomCourseStaffApi (
    fetchInstance: FetchInstance,
    school_id: string,
    payload: ClassroomCourseStaffPayload
) {
    return fetchInstance(
        API_ENDPOINTS.CREATE_CLASSROOM_COURSE_STAFF(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}

export function enrollStudentApi (
    fetchInstance: FetchInstance,
    school_id: string,
    payload: EnrollStudentPayload
) {
    return fetchInstance(
        API_ENDPOINTS.ENROLL_STUDENT(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}

export function assignClassroomStaffApi(
    fetchInstance: FetchInstance,
    school_id: string,
    payload: ClassroomStaffPayload
) {
    return fetchInstance(
        API_ENDPOINTS.ASSIGN_CLASSROOM_STAFF(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}