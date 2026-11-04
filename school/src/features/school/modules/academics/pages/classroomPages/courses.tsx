import { PageWrapper } from "@/features/school/components";
import { useSearchParams } from "react-router-dom";
import CreateClassroomCourseStaffDialog from "../../components/createClassroomCourseStaffDialog";



export default function ClassroomCourses({ refetchClassroom }:{refetchClassroom: () => void}) {
    const [searchParams, setSearchParams] = useSearchParams()

    const activeTab = searchParams.get("tab")
    if (!activeTab || activeTab !== "courses") {
        return (<></>)
    }

    return (
        <PageWrapper
            title={
                <h2 className="font-semibold text-2xl">Courses</h2>
            }
            className="w-full!"
            actions={[
                {
                    children: "Assign Course",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "assign-classroom-course-staff")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <CreateClassroomCourseStaffDialog 
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