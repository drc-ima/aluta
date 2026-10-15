import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
    userSchoolsApi
} from "./api"

export function useUserSchools() {
    const { fetchInstance } = useAuth()
  return useQuery({
    queryKey: [],
    queryFn: () => userSchoolsApi(fetchInstance),
  });
}