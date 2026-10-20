import { createBrowserRouter } from "react-router-dom";
import { LoginPage, RegisterPage } from "./features/auth/pages";
import { Dashboard } from "./features/school/pages";
import { AuthLayoutComponent } from "./features/auth/components";
import { Layout } from "./components/layout/layout";
import { UserDefaultsProvider } from "./contexts/userDefaultProvider";


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
        element: <UserDefaultsProvider><Layout /></UserDefaultsProvider>,
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />
            },
        ]
    }


])

export default router;