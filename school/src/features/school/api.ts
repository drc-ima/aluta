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
        "/user/schools",
        {
            method: "GET"
        }
    )
}