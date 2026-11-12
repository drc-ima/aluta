import { PageWrapper } from "@/features/school/components";
import type { ClassroomStaffAssignmentT } from "@/types/schoolClass";
import { useSearchParams } from "react-router-dom";
import AssignClassroomStaff from "../../components/assignClassroomStaff";

export default function ClassroomTeachers({
    refetchClassroom,
    teachers,
    loading
}: {
    refetchClassroom: () => void,
    teachers: ClassroomStaffAssignmentT[],
    loading: boolean
}) {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get("tab")
    if (activeTab && activeTab !== "teachers") {
        return (<></>)
    }
    return (
        <PageWrapper
            title={
                <h2 className="font-semibold text-2xl">Teachers</h2>
            }
            description="This is where you can assign class teachers."
            className="w-full!"
            actions={[
                {
                    children: "Assign Teacher",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "assign-classroom-staff")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <AssignClassroomStaff 
                refetch={refetchClassroom}
                handleOpenChange={(open) => {
                    if(!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
            />
        </PageWrapper>
    )
}