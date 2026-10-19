export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const API_ENDPOINTS = {
    // Auth
    TOKEN_LOGIN: "/token/login",
    ACCESS_TOKEN: "/token/refresh",

    // School
    REGISTER_SCHOOL: "/school/register",
    USER_SCHOOLS: "/user/schools",
    USER_SCHOOLS_CAMPUSES: "/user/schools-campuses",
    SCHOOL_ADDRESS: "/school/address",

    // User Defaults
    USER_DEFAULTS: "/user/defaults",
    UPDATE_USER_DEFAULTS: "/user/defaults"
}