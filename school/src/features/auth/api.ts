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

export function loginApi(
    fetchInstance: FetchInstance,
    payload: LoginPayload
) {
    return fetchInstance<LoginResponse>(
        "/token/login",
        {
            method: "POST",
            body: payload
        }
    )
}