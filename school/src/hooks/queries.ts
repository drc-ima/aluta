import { campusAcademicYearsApi, createAcademicPeriodApi, userDefaultsApi } from "@/api/api";
import { useAuth } from "@/contexts/authProvider";
import type { DefaultsProps } from "@/contexts/userDefaultProvider";
import type { AcademicPeriodPayload, AcademicPeriodT } from "@/types/academicPeriod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function useUserDefaults() {
    const {fetchInstance } = useAuth();

    return useQuery<DefaultsProps | null>({
        queryKey: ["user-defaults"],
        queryFn: () => userDefaultsApi(fetchInstance)
    })
}

export function useAcademicYears(campus_id: string, school_id: string) {
    const { fetchInstance } = useAuth();
    return useQuery<AcademicPeriodT[]>({
        queryKey: ["academic-periods", campus_id, school_id],
        queryFn: () => campusAcademicYearsApi(fetchInstance, campus_id, school_id),
        enabled: !!campus_id
    })
}

export function useCreateAcademicPeriod(campus_id: string, school_id: string) {
    const { fetchInstance } = useAuth();
    
    return useMutation({
        mutationFn: (payload: AcademicPeriodPayload|any) => createAcademicPeriodApi(fetchInstance, campus_id, school_id, payload)
    })
}