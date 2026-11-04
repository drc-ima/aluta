import { useLayout } from "@/contexts/layoutProvider";
import type { SchoolModuleT } from "@/types/staff";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import AcademicPeriods from "./pages/periods";
import Classrooms from "./pages/classrooms";
import ClassroomDetails from "./pages/classroomDetails";

export default function AcademicsModule({module}: {module: SchoolModuleT | null}) {
    const { changeNavLinks } = useLayout();
    const { nav, moduleSlug, id } = useParams();

    useEffect(() => {
        changeNavLinks([
            {
                title: "Academic Terms",
                href: `/${moduleSlug}`,
                isActive: !nav,
                disabled: false
            },
            {
                title: "Classrooms",
                href: `/${moduleSlug}/classrooms`,
                disabled: false,
                isActive: nav === "classrooms"
            },
            {
                title: "Enrollments",
                href: `/${moduleSlug}/enrollments`,
                disabled: false,
                isActive: nav === "enrollments"
            }
        ])
    }, [moduleSlug, nav])

    return (
        !nav ? (
            <AcademicPeriods />
        ) : nav === "classrooms" ? (
            !id ? <Classrooms /> : <ClassroomDetails />
            
        ) : (<></>)
    )
}