export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const API_ENDPOINTS = {
    // Auth
    TOKEN_LOGIN: "/token/login",
    ACCESS_TOKEN: "/token/refresh",
    TOKEN_LOGOUT: "/token/logout",

    // School
    REGISTER_SCHOOL: "/school/register",
    USER_SCHOOLS: "/user/schools",
    USER_SCHOOLS_CAMPUSES: "/user/schools-campuses",
    SCHOOL_ADDRESS: "/school/address",

    // User Defaults
    USER_DEFAULTS: "/user/defaults",
    UPDATE_USER_DEFAULTS: "/user/defaults",

    // Positions
    CREATE_POSITION: (school_id: string) => `/staff/positions/${school_id}`,
    FETCH_POSITIONS: (school_id: string) => `/staff/positions/${school_id}`,

    // Departments
    CREATE_DEPARTMENT: (school_id: string) => `/staff/departments/${school_id}`,
    FETCH_DEPARTMENTS: (school_id: string) => `/staff/departments/${school_id}`,

    // Staffs
    FETCH_STAFFS: (school_id: string) => `/staff/${school_id}`,
    CREATE_STAFF: (school_id: string) => `/staff/${school_id}`,
}