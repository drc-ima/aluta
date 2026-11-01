import { useLayout } from "@/contexts/layoutProvider";
import type { SchoolModuleT } from "@/types/staff";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Courses from "./pages/courses";

export default function CoursesModule({module}:{module: SchoolModuleT | null}) {
    const { changeNavLinks } = useLayout();
    const { nav, moduleSlug } = useParams();

    useEffect(() => {
        changeNavLinks([])
    }, [moduleSlug, nav])

    return (
        <Courses />
    )
}