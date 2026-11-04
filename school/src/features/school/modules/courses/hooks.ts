import { useAuth } from "@/contexts/authProvider"
import { useMutation, useQuery } from "@tanstack/react-query"
import { coursesApi, createCourseApi, type CoursePayload } from "./api";
import type { QueryParams } from "../staff/hooks";

export function useCourses({school_id, params}:{school_id: string, params?: QueryParams}) {
    const { fetchInstance } = useAuth();

    return useQuery({
        queryKey: ["courses", school_id, params],
        queryFn: ({ signal }) => coursesApi(fetchInstance, school_id, signal, params),
        enabled: !!school_id
    })
}

export function useCreateCourse(school_id: string) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: CoursePayload | any) => createCourseApi(fetchInstance, school_id, payload)
    })
}