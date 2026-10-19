import type { FetchInstance } from "@/types/fetchInstance";
import { API_ENDPOINTS } from "./api.endpoints";
import type { DefaultsProps } from "@/contexts/userDefaultProvider";

export function userDefaultsApi(
    fetchInstance: FetchInstance
) {
    return fetchInstance<DefaultsProps | null>(
        API_ENDPOINTS.USER_DEFAULTS,
        {
            method: "GET"
        }
    )
}

export type DefaultModulePayload = {
  entity_id: string;
  module_name: string
} & BodyInit

export function updateUserDefaultsApi(
  fetchInstance: FetchInstance,
  payload: DefaultModulePayload
) {
  return fetchInstance<DefaultsProps>(
    API_ENDPOINTS.UPDATE_USER_DEFAULTS,
    {
      method: "POST",
      body: payload
    }
  )
}