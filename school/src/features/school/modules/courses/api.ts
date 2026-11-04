import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";
import { type CourseT } from "@/types/course";
import type { QueryParams } from "../staff/hooks";

export function coursesApi(
    fetchInstance: FetchInstance,
    school_id: string,
    signal: AbortSignal,
    params?: QueryParams,
    
) {

    const query = new URLSearchParams()
    if (params) {
        if (params.page) {
            query.set("page", String(params.page));
        }
        if (params.limit) {
            query.set("limit", String(params.limit));
        }
        if (params.search) {
            query.set("search", params.search);
        }

        if (params.sorting) {
            const sort = params.sorting[0];

            if (sort) {
                query.set("sortBy", sort.id);
                query.set("sortOrder", sort.desc ? "desc" : "asc");
            }
        }

        if (params.filters) {
            // The backend must understand this filters format.
            query.set("filters", JSON.stringify(params.filters));
        }
    }


    return fetchInstance<CourseT[]>(
        `${API_ENDPOINTS.FETCH_COURSES(school_id)}?${query}`,
        {
            method: "GET",
            signal
        }
    )
}

export type CoursePayload = {
    name: string;
    description?: string;
    code: string
    department_id: string
} & BodyInit

export function createCourseApi(
    fetchInstance: FetchInstance,
    school_id: string,
    payload: CoursePayload
) {
    return fetchInstance<any>(
        API_ENDPOINTS.CREATE_COURSE(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}