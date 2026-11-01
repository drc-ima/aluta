import { useAuth } from "@/contexts/authProvider";
import type { ClassroomPayload } from "@/types/schoolClass";
import { useMutation, useQuery } from "@tanstack/react-query";
import { classroomsApi, createBulkClassroomsApi } from "./api";


export function useCreateBulkClassrooms(school_id: string, academic_period_id: string) {
    const { fetchInstance } = useAuth();

    return useMutation({
        mutationFn: (payload: ClassroomPayload | any) => createBulkClassroomsApi(fetchInstance, school_id, academic_period_id, payload)
    })
}

export function useClassrooms(school_id: string, academic_period_id: string) {
    const { fetchInstance } = useAuth();

    return useQuery({
        queryKey: ["ap-classrooms", school_id, academic_period_id],
        queryFn: () => classroomsApi(fetchInstance, school_id, academic_period_id),
        enabled: !!school_id && !!academic_period_id
    })
}