import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";
import type { RangeSchoolClassPayload, SchoolClassT } from "@/types/schoolClass";

export function classesApi(
    fetchInstance: FetchInstance,
    school_id: string,
    campus_id: string
) {
    return fetchInstance<SchoolClassT[]>(
        `${API_ENDPOINTS.FETCH_CLASSES(school_id, campus_id)}`,
        {
            method: "GET"
        }
    )
}

export function createRangeClassesApi(
    fetchInstance: FetchInstance,
    school_id:string,
    campus_id: string,
    payload: RangeSchoolClassPayload
) {
    return fetchInstance(
        `${API_ENDPOINTS.CREATE_RANGE_CLASSES(school_id, campus_id)}`,
        {
            method: "POST",
            body: payload
        }
    )
}

export function createClassApi(
    fetchInstance: FetchInstance,
    school_id:string,
    campus_id: string,
    payload: RangeSchoolClassPayload
) {
    return fetchInstance(
        `${API_ENDPOINTS.CREATE_CLASSES(school_id, campus_id)}`,
        {
            method: "POST",
            body: payload
        }
    )
}