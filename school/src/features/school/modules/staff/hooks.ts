import { useAuth } from "@/contexts/authProvider"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createDepartmentApi, createPositionApi, createStaffApi, departmentsApi, positionsApi, staffsApi, type DepartmentPayload, type PositionPayload, type StaffPayload } from "./api"
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

export function useSchoolPositions({ school_id, enabled }: { school_id: string, enabled: boolean }) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["staff-positions", school_id],
        queryFn: () => positionsApi(fetchInstance, school_id),
        enabled: !!school_id
    })
}

export function useCreateSchoolPosition(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: PositionPayload | any) => createPositionApi(fetchInstance, school_id, payload)
    })
}

export function useSchoolDepartments({ school_id, enabled }: { school_id: string, enabled: boolean }) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["staff-Departments", school_id],
        queryFn: () => departmentsApi(fetchInstance, school_id),
        enabled: !!school_id
    })
}

export function useCreateSchoolDepartment(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: DepartmentPayload | any) => createDepartmentApi(fetchInstance, school_id, payload)
    })
}
export type QueryParams = {
    page?: number;
    limit?: number;
    search?: string;
    filters?: ColumnFiltersState;
    sorting?: SortingState;
};
export function useSchoolStaffs({ school_id, params }: { school_id: string, params: QueryParams}) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["school-staffs", school_id, params],
        queryFn: ({ signal }) => staffsApi(fetchInstance, school_id, params, signal),
        enabled: !!school_id,
        placeholderData: (previousData) => previousData 
    })
}


export function useCreateSchoolStaff(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: StaffPayload | any) => createStaffApi(fetchInstance, school_id, payload)
    })
}