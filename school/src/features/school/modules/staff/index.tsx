
import { useLayout } from "@/contexts/layoutProvider";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import StaffOverview from "./pages/overview";
import Positions from "./pages/positions";
import Departments from "./pages/departments";
import Staff from "./pages/staff";

export default function StaffModule({module}: {module: any}) {
    const { changeNavLinks } = useLayout();
    const { nav, moduleSlug } = useParams();

    useEffect(() => {

        if(!module) return;
        if(moduleSlug !== module.module.slug) {
            return changeNavLinks([])
        }
        changeNavLinks([
        {
            title: "Overview",
            href: `/${moduleSlug}/overview`,
            disabled: false,
            isActive: nav === "overview" || !nav
        },
        {
            title: "All",
            href: `/${moduleSlug}/all`,
            disabled: false,
            isActive: nav === "all"

        },
        {
            title: "Departments",
            href: `/${moduleSlug}/departments`,
            disabled: false,
            isActive: nav === "departments"
        },
        {
            title: "Job Titles",
            href: `/${moduleSlug}/positions`,
            disabled: false,
            isActive: nav === "positions"
        }
    ])
    }, [moduleSlug, module, nav])


    return (
        nav === "overview" || !nav ? (
            <StaffOverview />
        ): nav === "positions" ? (
            <Positions />
        ): nav === "departments" ? (
            <Departments />
        ) : nav === "all" ? <Staff /> : null
    )
}
