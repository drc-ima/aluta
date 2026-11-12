import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";
import type { PositionT, StaffT } from "@/types/staff";
import type { QueryParams } from "./hooks";

export function positionsApi(
    fetchInstance: FetchInstance,
    school_id: string
) {
    return fetchInstance<PositionT[]>(
        API_ENDPOINTS.FETCH_POSITIONS(school_id),
        {
            method: "GET"
        }
    )
}

export enum EmploymentType {
    FULL_TIME = "Full Time",
    PART_TIME = "Part time",
    CONTRACTOR = "Contractor",
    DISMISSED = "Dismissed",
    RESIGNED = "Resigned",
}

export type PositionPayload = {
    name: string;
    description?: string;
    employment_type: EmploymentType
} & BodyInit

export function createPositionApi(
    fetchInstance: FetchInstance,
    school_id: string,
    payload: PositionPayload
) {
    return fetchInstance<any>(
        API_ENDPOINTS.CREATE_POSITION(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}

export function departmentsApi(
    fetchInstance: FetchInstance,
    school_id: string
) {
    return fetchInstance<any[]>(
        API_ENDPOINTS.FETCH_DEPARTMENTS(school_id),
        {
            method: "GET"
        }
    )
}

export type DepartmentPayload = {
    name: string;
    description?: string;
} & BodyInit

export function createDepartmentApi(
    fetchInstance: FetchInstance,
    school_id: string,
    payload: DepartmentPayload
) {
    return fetchInstance<any>(
        API_ENDPOINTS.CREATE_DEPARTMENT(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}

export type StaffResponse = {
    items: StaffT[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export function staffsApi(
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


    return fetchInstance<StaffResponse>(
        `${API_ENDPOINTS.FETCH_STAFFS(school_id)}?${query}`,
        {
            method: "GET",
            signal
        }
    )
}

export type StaffPayload = {
    user: {
        first_name: string,
        last_name: string,
        middle_name: string | null,
        email: string,
        phone: string | null,
    },
    staff_info: {
        staff_no: string,
        department_id: string,
        campus_id: string,
        parent_id: string | null
    },
    positions: {
        position_id: string,
        start_date: Date,
        end_date: Date | null
    }[]
} & BodyInit


export function createStaffApi(
    fetchInstance: FetchInstance,
    school_id: string,
    payload: StaffPayload
) {
    return fetchInstance<StaffT>(
        API_ENDPOINTS.CREATE_STAFF(school_id),
        {
            method: "POST",
            body: payload
        }
    )
}