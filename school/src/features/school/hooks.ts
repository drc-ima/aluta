import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
  schoolAddressApi,
  userSchoolsApi,
  userSchoolsCampusesApi,
  type GpsAddressPayload
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