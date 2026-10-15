
import { createContext, useCallback, useContext, useEffect } from "react"
import { toast } from "sonner";

type AuthProviderProps = {
    children: React.ReactNode
}

type AuthProviderState = {
    fetchInstance: <T = unknown>(
        path: string,
        options?: RequestOptions,
    ) => Promise<T>;
    getAccessToken: () => Promise<void>;
    redirectTo: string;

}

type RequestOptions = Omit<RequestInit, "body"> & {
    body?: unknown;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const ACCESS_TOKEN_KEY = "aluta_sess"
const NO_AUTH_ROUTES: string[] = [
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

    const redirectTo = isPublicRoute
        ? currentRoutePath
        : `/?next=${encodeURIComponent(
            window.location.pathname +
            window.location.search,
        )}`;

    const getAccessToken = useCallback(async (): Promise<void> => {
        return fetch(`${API_BASE_URL}/token/refresh`, {
            method: "POST",
            credentials: "include"
        }).then(async(res) => {
            if (res.ok){
                return await res.json()  
            } 
        })
        .then((data) => {
            localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
            return data.access_token
        }).catch((e) => {
            console.error(e)
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            return ""
        })
    }, []);

    useEffect(() => {
        if (!accessToken && !isPublicRoute) {
            // try getting an access token from an existing refresh token
            const at = getAccessToken()
            if(!at){
                window.location.replace(redirectTo);
            }
            
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
                        ...(body !== undefined
                            ? { "Content-Type": "application/json" }
                            : {}),
                        ...headers,
                    },
                    ...(body !== undefined
                        ? { body: JSON.stringify(body) }
                        : {}),
                },
            );

            if (!response.ok) {
                const message = await response.text();

                if(response.status === 401) {
                    toast.error("No valid session found. Redirecting to login")
                    window.location.href = redirectTo
                }
                throw new Error(
                    message || `Request failed (${response.status})`,
                );
            }

            if (response.status === 204) {
                return undefined as T;
            }

            return response.json() as Promise<T>;
        },
        [],
    );

    return (
        <AuthContext.Provider
            value={{
                fetchInstance,
                getAccessToken,
                redirectTo,
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