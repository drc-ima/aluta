import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
    loginApi,
    type LoginPayload
} from "./api"

export function useLogin() {
    const { noAuthFetchInstance } = useAuth();

    return useMutation({
        mutationFn: (payload: LoginPayload | any) => loginApi(noAuthFetchInstance, payload)
    })
}