import { createBrowserRouter } from "react-router-dom";
import { LoginPage, RegisterPage } from "./features/auth/pages";
import { Dashboard, SchoolSelector } from "./features/school/pages";
import { AuthLayoutComponent } from "./features/auth/components";
import { Layout } from "./components/layout/layout";


const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthLayoutComponent />,
        children: [
            {
                path: "/",
                element: <LoginPage />
            },
            {
                path: "/register",
                element: <RegisterPage />
            }
        ]
    },
    {
        element: <Layout />,
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />
            },
        ]
    }


])

export default router;