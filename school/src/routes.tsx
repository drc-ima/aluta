import { createBrowserRouter } from "react-router-dom";
import { LoginPage, RegisterPage } from "./features/auth/pages";
import { Dashboard } from "./features/school/pages";
import { AuthLayoutComponent } from "./features/auth/components";
import { Layout } from "./components/layout/layout";
import { UserDefaultsProvider } from "./contexts/userDefaultProvider";
import ModulePage from "./features/school/modules";
import { LayoutProvider } from "./contexts/layoutProvider";


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
        element: <UserDefaultsProvider><LayoutProvider><Layout /></LayoutProvider></UserDefaultsProvider>,
        children: [
            {
                path: "/overview",
                element: <Dashboard />
            },
            {
                path: "/:moduleSlug/:nav?",
                element: <ModulePage />
            }
        ]
    }


])

export default router;