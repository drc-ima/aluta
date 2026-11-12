import type { FetchInstance } from "@/types/fetchInstance"
import type { StudentT } from "@/types/student"
import type { QueryParams } from "../staff/hooks"
import { API_ENDPOINTS } from "@/api/api.endpoints"
import type { BioForm } from "./components/createStudentSteps/bio"
import type { GuardiansForm } from "./components/createStudentSteps/guardians"

export type StudentResponse = {
    items: StudentT[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export function studentsApi(
    fetchInstance: FetchInstance,
    school_id: string,
    params: QueryParams,
    signal: AbortSignal
) {
    const query = new URLSearchParams()
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


    return fetchInstance<StudentResponse>(
        `${API_ENDPOINTS.FETCH_STUDENTS(school_id)}?${query}`,
        {
            method: "GET",
            signal
        }
    )
}

export type  StudentPayload = {
    bio: BioForm,
    guardians: GuardiansForm["guardians"],
} & BodyInit

export function createStudentApi(
    fetchInstance: FetchInstance,
    school_id: string,
    campus_id: string,
    payload: StudentPayload
) {
    return fetchInstance<any>(
        API_ENDPOINTS.CREATE_STUDENT(school_id, campus_id),
        {
            method: "POST",
            body: payload,
        }
    )
}