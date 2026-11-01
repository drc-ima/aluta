import type { FetchInstance } from "@/types/fetchInstance";
import { API_ENDPOINTS } from "./api.endpoints";
import type { DefaultsProps } from "@/contexts/userDefaultProvider";
import type { AcademicPeriodPayload, AcademicPeriodT } from "@/types/academicPeriod";

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

export function campusAcademicYearsApi(
  fetchInstance: FetchInstance,
  campus_id: string,
  school_id: string
) {
  return fetchInstance<AcademicPeriodT[]>(
    API_ENDPOINTS.FETCH_ACADEMIC_YEARS(campus_id, school_id),
    {
      method:"GET"
    }
  )
}

export function createAcademicPeriodApi(
  fetchInstance: FetchInstance,
  campus_id: string,
  school_id: string,
  payload: AcademicPeriodPayload 
) {
  return fetchInstance(
    `${API_ENDPOINTS.CREATE_ACADEMIC_PERIOD(campus_id, school_id)}`,
    {
      method: "POST",
      body: payload
    }
  )
}