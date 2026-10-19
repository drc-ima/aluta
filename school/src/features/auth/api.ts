import { API_ENDPOINTS } from "@/api/api.endpoints";
import type { FetchInstance } from "@/types/fetchInstance";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}


export type LoginPayload = {
  username: string;
  password: string;
} & BodyInit

export function loginApi(
    fetchInstance: FetchInstance,
    payload: LoginPayload | any
) {
    return fetchInstance<LoginResponse>(
        API_ENDPOINTS.TOKEN_LOGIN,
        {
            method: "POST",
            body: payload
        }
    )
}

export type RegisterPayload = {
  school: {
    name: string;
    business_email: string;
    website: string;
  },
  campus: {
    name: string;
    gps_code: string;
    address: {[key: string]: any} | null;
    addressStr: string,
    contacts: {
      contact_type: "Email" | "Phone" | string;
      contact: string;
    }[]
  },
  creator: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    phone: string;
    password: string;
  }
} & BodyInit

export function registerApi(
  fetchInstance: FetchInstance,
  payload: RegisterPayload
) {
  return fetchInstance(
    API_ENDPOINTS.REGISTER_SCHOOL,
    {
      method: "POST",
      body: payload
    }
  )
}