import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider"
import { PageWrapper } from "@/features/school/components"
import { useSearchParams } from "react-router-dom"
import LoadClassroomDialog from "../components/loadClassroomDialog"
import { useClassrooms } from "../hooks"

export default function Classrooms() {
    const { currentAcademicYear } = useUserDefaultsProvider()
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        isLoading: loading,
        data: classrooms,
        refetch
    } = useClassrooms(currentAcademicYear?.school_id!, currentAcademicYear?.id!)
    return (
        <PageWrapper
            title="Classrooms"
            description="A classroom is active class sessions of the current academic year."
            actions={[
                {
                    children: "Load Classrooms",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "load-create")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <LoadClassroomDialog
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
                refetch={refetch}
            />
        </PageWrapper>
    )
}
