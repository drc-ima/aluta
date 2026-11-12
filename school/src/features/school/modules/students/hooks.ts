import { useAuth } from "@/contexts/authProvider";
import type { QueryParams } from "../staff/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createStudentApi, studentsApi, type StudentPayload } from "./api";

export function useSchoolStudents(
    school_id: string,
    params: QueryParams
) {
    const { fetchInstance } = useAuth();

    return useQuery({
        queryKey: ["school-students", school_id, params],
        queryFn: ({ signal }) => studentsApi(fetchInstance, school_id, params, signal),
        enabled: !!school_id,
        placeholderData: (prev) => prev
    })
}

export function useCreateStudent(
    school_id: string,
    campus_id: string
) {
    const { fetchInstance } = useAuth()

    return useMutation({
        mutationFn: (payload: StudentPayload | any) => createStudentApi(fetchInstance, school_id, campus_id, payload)
    })
}