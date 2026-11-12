import { PageWrapper } from "@/features/school/components";
import { useSearchParams } from "react-router-dom";
import CreateClassroomCourseStaffDialog from "../../components/createClassroomCourseStaffDialog";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ClassroomCourseStaffT } from "@/types/schoolClass";
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { LongText } from "@/components/ui/longText";



export default function ClassroomCourses({ 
    refetchClassroom, 
    courses, 
    loading }:{
        refetchClassroom: () => void,
        courses: ClassroomCourseStaffT[],
        loading: boolean
    }) {
    const [searchParams, setSearchParams] = useSearchParams()

    const activeTab = searchParams.get("tab")
    if (activeTab !== "courses") {
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
            <DataTable 
                data={courses}
                paginate={false}
                search={{}}
                totalRows={courses.length}
                columns={columns}
                filters={[]}
                searchKey=""
                loading={loading}
                filterOptions={[]}
            />
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

const columns: ColumnDef<DataTableFeatures, ClassroomCourseStaffT>[] = [
    {
        id: "course",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Course" />
        ),
        cell: ({ row }) => {
            return <LongText>[{row.original.course.code}] {row.original.course.name}</LongText>
        },
        enableHiding: false,
        enableSorting: true
    },
    {
        id: "staff",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Staff" />
        ),
        cell: ({ row }) => {
            return <LongText>{row.original.staff.user.full_name}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "enrollments",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total Enrollments" />
        ),
        cell: ({ row }) => {
            return <LongText>{row.original.enrollments.length}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "action",
        cell: ({ row }) => {
            return <LongText>Actions</LongText>
        },
        enableHiding: false,
        enableSorting: false
    }
]