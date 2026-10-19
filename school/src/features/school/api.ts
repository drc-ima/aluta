import { API_ENDPOINTS } from "@/api/api.endpoints";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
type FetchInstance = <T = unknown>(
  path: string,
  options?: RequestInit & { body?: unknown },
) => Promise<T>;

export interface LoginPayload {
  username: string;
  password: string;
}

export function userSchoolsApi(
    fetchInstance: FetchInstance,
) {
    return fetchInstance<any[]>(
        API_ENDPOINTS.USER_SCHOOLS,
        {
            method: "GET"
        }
    )
}

export type SchoolCampusProps = {
  school_id: string;
  campus_id: string;
  school_name: string;
  campus_name: string;
}

export function userSchoolsCampusesApi(
    fetchInstance: FetchInstance,
) {
    return fetchInstance<SchoolCampusProps[]>(
        API_ENDPOINTS.USER_SCHOOLS_CAMPUSES,
        {
            method: "GET"
        }
    )
}




export type GpsAddress = {
  Table: {[key: string]: any}[]
}

export type GpsAddressPayload = {
gps_code: string
} & BodyInit

export function schoolAddressApi(
  fetchInstance: FetchInstance,
  payload: GpsAddressPayload
){
  return fetchInstance<GpsAddress>(
    API_ENDPOINTS.SCHOOL_ADDRESS,
    {
      method: "POST",
      body: payload
    }
  )
}