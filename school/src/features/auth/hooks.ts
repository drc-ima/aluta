import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
    loginApi,
    LogoutApi,
    type LoginPayload
} from "./api"

export function useLogin() {
    const { noAuthFetchInstance } = useAuth();

    return useMutation({
        mutationFn: (payload: LoginPayload | any) => loginApi(noAuthFetchInstance, payload)
    })
}

export function useLogout() {
    const { fetchInstance } = useAuth();

    return useMutation({
        mutationFn: () => LogoutApi(fetchInstance)
    })
}