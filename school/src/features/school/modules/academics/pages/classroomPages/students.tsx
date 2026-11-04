import { PageWrapper } from "@/features/school/components";
import { useSearchParams } from "react-router-dom";

export default function ClassroomStudents() {
    const [searchParams] = useSearchParams()

    const activeTab = searchParams.get("tab")
    if (activeTab && activeTab !== "students") {
        return (<></>)
    }
    return (
        <PageWrapper
            title={
                <h2 className="font-semibold text-2xl">Students</h2>
            }
        >
            sss
        </PageWrapper>
    )
}