
import { API_BASE_URL, API_ENDPOINTS } from "@/api/api.endpoints";
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { jwtDecode } from 'jwt-decode';
import { toast } from "sonner";

type AuthProviderProps = {
    children: React.ReactNode
}

type AuthProviderState = {
    fetchInstance: <T = unknown>(
        path: string,
        options?: RequestOptions,
    ) => Promise<T>;
    noAuthFetchInstance: <T = unknown>(
        path: string,
        options?: RequestOptions,
    ) => Promise<T>;
    getAccessToken: () => Promise<string>;
    redirectTo: string;
    user: {[key: string]: any} | null

}

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

const ACCESS_TOKEN_KEY = "aluta_sess"
export const NO_AUTH_ROUTES: string[] = [
    "/",
    "/register",
    "/forgot-password",
    "terms",
    "/privacy"
]

const AuthContext = createContext<AuthProviderState | undefined>(undefined);

export function AuthProvider({
    children
}: AuthProviderProps) {
    const currentRoutePath = window.location.pathname
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const isPublicRoute = NO_AUTH_ROUTES.includes(
        currentRoutePath,
    );
    const [user, setUser] = useState<{[key: string]: any} | null>(null)

    const redirectTo = isPublicRoute
        ? currentRoutePath
        : `/?next=${encodeURIComponent(
            window.location.pathname +
            window.location.search,
        )}`;

    const updateUser = (token: string | null) => {
        if(!token) {
            setUser(null)
            return
        }
        const decoded = jwtDecode(token) as {[key: string]: any}

        setUser(decoded)
    }

    const getAccessToken = useCallback(async (): Promise<string> => {

        return fetch(`${API_BASE_URL}${API_ENDPOINTS.ACCESS_TOKEN}`, {
            method: "POST",
            credentials: "include"
        }).then(async (res) => {
            if (res.ok) {
                const data = await res.json()
                localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
                    
                    return data.access_token

            }
            return ""
        })
            .catch((e) => {
                console.error(e)
                localStorage.removeItem(ACCESS_TOKEN_KEY)
                return ""
            })
    }, []);


    useEffect(() => {
        if (!accessToken && !isPublicRoute) {
            updateUser(null)
            // try getting an access token from an existing refresh token
           window.location.replace(redirectTo);
            
        } else {
            updateUser(accessToken)
        }
    }, [accessToken, isPublicRoute, redirectTo]);

    const fetchInstance = useCallback(
        async <T = unknown,>(
            path: string,
            options: RequestOptions = {},
        ): Promise<T> => {
            const { body, headers, ...init } = options;
            const token = await getAccessToken();
            const response = await fetch(
                `${API_BASE_URL}${path}`,
                {
                    ...init,
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
                        ...headers,
                    },
                    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
                },
            );

            if (!response.ok) {
                const message = await response.text();

                if (response.status === 401) {
                    // toast.error("No valid session found. Redirecting to login")
                    // window.location.href = redirectTo
                }
                    console.log(message, response.status)
                if(response.status === 403) {
                    
                    toast.error(JSON.parse(message).detail)
                }
                throw new Error(
                    message || `Request failed (${response.status})`,
                );
            }

            // if (response.status === 204) {
            //     return undefined as T;
            // }

            return response.json() as Promise<T>;
        },
        [],
    );

    const noAuthFetchInstance = useCallback(
        async <T = unknown,>(
            path: string,
            options: RequestOptions = {},
        ): Promise<T> => {
            const { body, headers, ...init } = options;
            const response = await fetch(
                `${API_BASE_URL}${path}`,
                {
                    ...init,
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
                        ...headers,
                    },
                    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
                },
            );

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message || `Request failed (${response.status})`,
                );
            }

            // if (response.status === 204) {
            //     return undefined as T;
            // }

            return response.json() as Promise<T>;
        },
        [],
    );

    return (
        <AuthContext.Provider
            value={{
                fetchInstance,
                noAuthFetchInstance,
                getAccessToken,
                redirectTo,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within a AuthProvider')

    return context
}