import { PageWrapper } from "@/features/school/components";
import type { ClassroomStaffAssignmentT } from "@/types/schoolClass";
import { useSearchParams } from "react-router-dom";
import AssignClassroomStaff from "../../components/assignClassroomStaff";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
            <DataTable 
                data={teachers}
                loading={loading}
                search={{}}
                totalRows={teachers.length}
                columns={columns}
                filters={[]}
                searchKey=""
                filterOptions={[]}
                paginate={false}
                withHeader={false}
            />
            <AssignClassroomStaff
                refetch={refetchClassroom}
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
            />
        </PageWrapper>
    )
}

const columns: ColumnDef<DataTableFeatures, ClassroomStaffAssignmentT>[] = [
    {
        id: "fullName",
        cell: ({ row }) => {
            const fullName = row.original.staff.user.full_name;
            const profile = row.original.staff.media.find(md => md.media_type === "profile")
            const staffNo = row.original.staff.staff_departments.length > 0 ? row.original.staff.staff_departments[0].department.name : ""
            const jobTitles = row.original.staff.staff_positions.filter(sp => sp.end_date === null).map(sp => sp.position.name)
            return (
                <div className="flex items-start gap-[0.5rem]">
                    <Avatar className='h-10 w-10'>
                        <AvatarImage src={profile?.blob_url} alt={`${fullName} profile`} />
                        <AvatarFallback>{row.original?.staff.user.first_name[0].toUpperCase()}{row.original?.staff.user.last_name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{fullName}</span>
                        <div className="flex items-center gap-[0.2rem]">
                            {
                                jobTitles.map((jt) => ( 
                                    <span key={jt}>{jt}</span>
                                ))
                            }
                            <span>|</span>
                            <span>{staffNo}</span>
                        </div>
                    </div>
                    
                </div>
            )
        }
    },
    {
        id: "action",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col items-end">
                    {
                        row.original.head && (
                            <Badge variant={"secondary"} className="rounded-full!">
                                HEAD TEACHER
                            </Badge>
                        )
                    }
                </div>
            )
        },
    }
]