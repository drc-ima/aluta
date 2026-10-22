import { useParams } from "react-router-dom"
import StaffPage from "./staff"
import { useEffect, useState } from "react";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";

export default function ModulePage(){
    const { moduleSlug } = useParams();
    const [selectedModule, setSelectedModule] = useState<any|null>(null)
    const { selectedSchool } = useUserDefaultsProvider()

    useEffect(() => {
        if(!moduleSlug) return;
        if(!selectedSchool) return;
        const module = selectedSchool.modules.find((module: any) => module.module.slug === moduleSlug)
        setSelectedModule(module)
    }, [moduleSlug, selectedSchool])
    return (
        moduleSlug === "staff" ? <StaffPage module={selectedModule} /> : <></>
    )
}