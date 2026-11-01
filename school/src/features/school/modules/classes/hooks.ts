import { useAuth } from "@/contexts/authProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { classesApi, createRangeClassesApi } from "./api";
import type { RangeSchoolClassPayload } from "@/types/schoolClass";

export function useSchoolClasses(school_id: string, campus_id: string) {
    const { fetchInstance } = useAuth();

    return useQuery({
        queryKey: ["school-classes", school_id, campus_id],
        queryFn: () => classesApi(fetchInstance, school_id, campus_id),
        enabled: !!school_id && !!campus_id
    })
}

export function useCreateRangeClasses(school_id: string, campus_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: RangeSchoolClassPayload | any) => createRangeClassesApi(fetchInstance, school_id, campus_id, payload)
    })
}