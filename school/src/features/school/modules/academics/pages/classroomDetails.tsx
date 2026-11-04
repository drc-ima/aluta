import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useClassroomDetails } from "../hooks"
import { PageWrapper } from "@/features/school/components"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SidebarNav } from "@/components/sidebarNav"
import { Separator } from "@/components/ui/separator"
import ClassroomStudents from "./classroomPages/students"
import ClassroomCourses from "./classroomPages/courses"



export default function ClassroomDetails() {
    const { id } = useParams()
    const { selectedCampus, currentAcademicYear } = useUserDefaultsProvider()
    const navigate = useNavigate()

    const [searchParams] = useSearchParams()

    const activeTab = searchParams.get("tab")
    const tabs = [
        {
            title: 'Enrollments',
            href: '?tab=students',
            isActive: activeTab === "students" || !activeTab
    },
        {
            title: 'Courses',
            href: '?tab=courses',
            isActive: activeTab === "courses"
        },
        {
            title: 'TimeTable',
            href: '?tab=timestables',
            isActive: activeTab === "timestables"
        }
    ]

    const {
        isLoading: loading,
        data: classroom,
        refetch: refetchClassroom
    } = useClassroomDetails(selectedCampus?.school_id!, id!, currentAcademicYear?.id!)
    return (
        <PageWrapper
            title={
                <div className="flex items-center gap-[0.5rem]">
                    <h1 className='text-2xl font-bold tracking-tight'>{classroom?.school_class.name}</h1>
                    {
                        classroom?.sections && classroom.sections.length > 1 && classroom.sections.map(sec => (
                            <Badge
                                key={sec.id}
                                variant={sec.id === classroom.id ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                    navigate(`/academics/classrooms/${sec?.id}${activeTab ? `?tab=${activeTab}` : ""}`)
                                }}>
                                {sec.school_class.section}
                            </Badge>
                        ))
                    }
                </div>
            }
            actions={[
                {
                    children: <ChevronLeft />,
                    variant: "secondary",
                    size: "sm",
                    title: "Previous Classroom",
                    type: "button",
                    className: "rounded-full!",
                    disabled: classroom?.previous_id === null || undefined,
                    onClick: () => {
                        navigate(`/academics/classrooms/${classroom?.previous_id}${activeTab ? `?tab=${activeTab}` : ""}`)
                    }
                },
                {
                    children: <ChevronRight />,
                    variant: "secondary",
                    title: "Next Classroom",
                    size: "sm",
                    className: "rounded-full!",
                    type: "button",
                    disabled: classroom?.next_id === null || undefined,
                    onClick: () => {
                        navigate(`/academics/classrooms/${classroom?.next_id}${activeTab ? `?tab=${activeTab}` : ""}`)
                    }
                }
            ]}
        >
            <Separator />
            <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <aside className='top-0 lg:sticky lg:w-1/5'>
                    <SidebarNav items={tabs} />
                </aside>
                <div className='flex w-full overflow-y-hidden p-1'>
                    <ClassroomStudents />
                    <ClassroomCourses
                        refetchClassroom={refetchClassroom}
                    />
                </div>
            </div>
        </PageWrapper>
    )
}