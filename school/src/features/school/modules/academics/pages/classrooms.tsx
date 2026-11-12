import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider"
import { PageWrapper } from "@/features/school/components"
import { useSearchParams } from "react-router-dom"
import LoadClassroomDialog from "../components/loadClassroomDialog"
import { useClassrooms } from "../hooks"
import ClassroomCard from "@/components/classroomCard"

export default function Classrooms() {
    const { currentAcademicYear } = useUserDefaultsProvider()
    const [searchParams, setSearchParams] = useSearchParams()

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
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-[1rem]">
                {
                    classrooms?.map((classroom, index) => (
                        <ClassroomCard 
                            id={classroom.id} 
                            key={index} 
                            title={classroom.school_class.name + "" + (classroom.school_class.section ? " " + classroom.school_class.section : "")} 
                            attrs={[
                                {key: "Students", value: `${classroom.enrollments_count} / ${classroom.school_class.capacity}`},
                                {key: "Courses", value: classroom.courses_count}
                            ]}
                            href={`/academics/classrooms/${classroom.id}`}
                        />
                    ))
                }
                
                
            </div>
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
