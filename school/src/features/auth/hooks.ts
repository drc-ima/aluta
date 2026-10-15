import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "@/contexts/authProvider";

import {
    loginApi
} from "./api"

export function useLogin() {
    const { fetchInstance } = useAuth();

    return useMutation({
        mutationFn: (payload: {
            username: string;
            password: string
        }) => loginApi(fetchInstance, payload)
    })
}