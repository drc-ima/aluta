import { useLayout } from "@/contexts/layoutProvider";
import type { SchoolModuleT } from "@/types/staff";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Students from "./pages/students";
import Guardians from "./pages/guardians";

export default function StudentModule({module}: { module: SchoolModuleT | null}) {
    const { changeNavLinks } = useLayout();
    const { nav, moduleSlug } = useParams();
    
    useEffect(() => {
        changeNavLinks([
            {
                title: "Overview",
                href: `${moduleSlug}/overview`,
                disabled: false,
                isActive: nav === "overview" || !nav
            },
            {
                title: "Students",
                href: `${moduleSlug}/students`,
                disabled: false,
                isActive: nav === "students"
            },
            {
                title: "Guardians",
                href: `${moduleSlug}/guardians`,
                disabled: false,
                isActive: nav === "guardians"
            },
        ])

    }, [module, nav, moduleSlug])

    return (
        nav === "overview" || !nav ? (
            <></>
        ) : nav === "students" ? (
            <Students />
        ) : nav === "guardians" ? (
            <Guardians />
        ): null
    )
}