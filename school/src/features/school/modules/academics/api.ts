import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";
import type { ClassroomPayload, ClassroomT } from "@/types/schoolClass";


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