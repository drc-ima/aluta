import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./features/auth/pages";
import { SchoolSelector } from "./features/school/pages";


const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path:"/school-selector",
        element: <SchoolSelector />
    }
])

export default router;