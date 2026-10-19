import { userDefaultsApi } from "@/api/api";
import { useAuth } from "@/contexts/authProvider";
import type { DefaultsProps } from "@/contexts/userDefaultProvider";
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