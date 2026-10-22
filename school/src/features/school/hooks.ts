import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
  createDepartmentApi,
  createPositionApi,
  departmentsApi,
  positionsApi,
  schoolAddressApi,
  userSchoolsApi,
  userSchoolsCampusesApi,
  type DepartmentPayload,
  type GpsAddressPayload,
  type PositionPayload
} from "./api"
import { registerApi, type RegisterPayload } from "../auth/api";
import { updateUserDefaultsApi, type DefaultModulePayload } from "@/api/api";

export function useUserSchools({ enabled}: {enabled: boolean}) {
  const { fetchInstance } = useAuth()
  return useQuery({
    queryKey: ["user-schools"],
    queryFn: () => userSchoolsApi(fetchInstance),
    enabled: enabled ?? true
  });
}

export function useUserSchoolsCampuses({ enabled}: {enabled: boolean}) {
  const { fetchInstance } = useAuth()
  return useQuery({
    queryKey: ["user-schools-campuses"],
    queryFn: () => userSchoolsCampusesApi(fetchInstance),
    enabled: enabled ?? true
  });
}

export function useSchoolAddress() {
  const { fetchInstance } = useAuth()

  return useMutation({
    mutationFn: (payload: GpsAddressPayload | any) => schoolAddressApi(fetchInstance, payload)
  })
}

export function useRegisterSchool() {
  const { noAuthFetchInstance } = useAuth()

  return useMutation({
    mutationFn: (payload: RegisterPayload | any) => registerApi(noAuthFetchInstance, payload)
  })
}



export function useUpdateDefaults(){
  const {fetchInstance} = useAuth();

  return useMutation({
    mutationFn: (payload: DefaultModulePayload[] | any) => updateUserDefaultsApi(fetchInstance, payload)
  })
}

export function useSchoolPositions({school_id, enabled}:{school_id: string, enabled: boolean}){
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

export function useSchoolDepartments({school_id, enabled}:{school_id: string, enabled: boolean}){
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