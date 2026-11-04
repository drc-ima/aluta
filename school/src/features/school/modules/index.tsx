import { useParams } from "react-router-dom"
import StaffModule from "./staff"
import { useEffect, useState } from "react";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import type { SchoolModuleT } from "@/types/staff";
import CoursesModule from "./courses";
import StudentModule from "./students";
import ClassesModule from "./classes";
import AcademicsModule from "./academics";

export default function ModulePage(){
    const { moduleSlug } = useParams();
    const [selectedModule, setSelectedModule] = useState<SchoolModuleT|null>(null)
    const { selectedSchool } = useUserDefaultsProvider()
    
    const modulesPages: Record<string, React.JSX.Element> = {
        staff: <StaffModule module={selectedModule} />,
        courses: <CoursesModule module={selectedModule} />,
        students: <StudentModule module={selectedModule} />,
        classes: <ClassesModule module={selectedModule} />,
        academics: <AcademicsModule module={selectedModule} />
    }
    useEffect(() => {
        if(!moduleSlug) return;
        if(!selectedSchool) return;
        const module = selectedSchool.modules.find((module) => module.module.slug === moduleSlug) || null
        setSelectedModule(module)
    }, [moduleSlug, selectedSchool])
    return (
        moduleSlug ? modulesPages[moduleSlug] : null
    )
}