import {
  useMutation,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
    forgotPasswordApi,
    loginApi,
    LogoutApi,
    type ForgotPasswordPayload,
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

export function useForgotPassword() {
    const { noAuthFetchInstance } = useAuth();

    return useMutation({
        mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordApi(noAuthFetchInstance, payload)
    })
}