import { useAuth } from "@/contexts/authProvider"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createDepartmentApi, createPositionApi, createStaffApi, departmentsApi, positionsApi, staffsApi, type DepartmentPayload, type PositionPayload, type StaffPayload } from "./api"

export function useSchoolPositions({ school_id, enabled }: { school_id: string, enabled: boolean }) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["staff-positions"],
        queryFn: () => positionsApi(fetchInstance, school_id),
        enabled: enabled
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
        queryKey: ["staff-Departments"],
        queryFn: () => departmentsApi(fetchInstance, school_id),
        enabled: enabled
    })
}

export function useCreateSchoolDepartment(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: DepartmentPayload | any) => createDepartmentApi(fetchInstance, school_id, payload)
    })
}

export function useSchoolStaffs({ school_id, enabled }: { school_id: string, enabled?: boolean }) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["school-staffs"],
        queryFn: () => staffsApi(fetchInstance, school_id),
        enabled: enabled
    })
}

export function useCreateSchoolStaff(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: StaffPayload | any) => createStaffApi(fetchInstance, school_id, payload)
    })
}