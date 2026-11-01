import { useLayout } from "@/contexts/layoutProvider";
import type { SchoolModuleT } from "@/types/staff";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Classes from "./pages/classes";

export default function ClassesModule({module}: {module: SchoolModuleT | null}) {
    const { changeNavLinks } = useLayout();
    const { nav, moduleSlug } = useParams();

    useEffect(() => {
        changeNavLinks([
            {
                title: "Classes",
                href: `/${moduleSlug}`,
                isActive: !nav,
                disabled: false
            },
            {
                title: "Classrooms",
                href: `/${moduleSlug}/classrooms`,
                disabled: false,
                isActive: nav === "classrooms"
            }
        ])
    }, [moduleSlug, nav])

    return (
        !nav ? (
            <Classes />
        ) : (<></>)
    )
}