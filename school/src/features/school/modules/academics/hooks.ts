import { useAuth } from "@/contexts/authProvider";
import type { ClassroomCourseStaffPayload, ClassroomPayload } from "@/types/schoolClass";
import { useMutation, useQuery } from "@tanstack/react-query";
import { classroomDetailsApi, classroomsApi, createBulkClassroomsApi, createClassroomCourseStaffApi } from "./api";


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

export function useClassroomDetails(school_id: string, classroom_id: string, academic_period_id: string) {
    const { fetchInstance } = useAuth()

    return useQuery({
        queryKey: ["classroom-details", school_id, academic_period_id, classroom_id],
        queryFn: () => classroomDetailsApi(fetchInstance, school_id, academic_period_id, classroom_id),
        enabled: !!school_id && !!classroom_id && !!academic_period_id
    })
}

export function useCreateClassroomCourseStaff(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: ClassroomCourseStaffPayload | any) => createClassroomCourseStaffApi(fetchInstance, school_id, payload)
    })
}