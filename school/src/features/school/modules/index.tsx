import { useParams } from "react-router-dom"
import StaffModule from "./staff"
import { useMemo } from "react";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";

import CoursesModule from "./courses";
import StudentModule from "./students";
import ClassesModule from "./classes";
import AcademicsModule from "./academics";

export default function ModulePage(){
    const { moduleSlug } = useParams();
    // const [selectedModule, setSelectedModule] = useState<SchoolModuleT|null>(null)
    const { selectedSchool } = useUserDefaultsProvider()
    
    const selectedModule = useMemo(() => {
        if (!moduleSlug) return null;
        if(!selectedSchool) return null;
        const module = selectedSchool.modules.find((module) => module?.module.slug === moduleSlug)
        return module ? module : null
    }, [moduleSlug, selectedSchool])

    const modulesPages: Record<string, React.JSX.Element> = useMemo(() => {
        return {
        staff: <StaffModule module={selectedModule} />,
        courses: <CoursesModule module={selectedModule} />,
        students: <StudentModule module={selectedModule} />,
        classes: <ClassesModule module={selectedModule} />,
        academics: <AcademicsModule module={selectedModule} />
    }
    }, [selectedModule])
    


    return (
        moduleSlug ? modulesPages[moduleSlug] : null
    )
}