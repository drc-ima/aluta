import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LongText } from "@/components/ui/longText";
import { PageWrapper } from "@/features/school/components";
import type { StudentT } from "@/types/student";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";
import EnrollStudentDialog from "../../components/enrollStudentDialog";

export default function ClassroomStudents({
    refetchClassroom,
    students,
    loading
}: {
    refetchClassroom: () => void,
    students: StudentT[],
    loading: boolean
}) {
    const [searchParams, setSearchParams] = useSearchParams()

    const activeTab = searchParams.get("tab")
    if (activeTab !== "students") {
        return (<></>)
    }
    return (
        <PageWrapper
            title={
                <h2 className="font-semibold text-2xl">Students</h2>
            }
            className="w-full!"
            actions={[
                {
                    children: "Enroll Student",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "enroll-student")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={students}
                paginate={false}
                search={{}}
                totalRows={students.length}
                columns={columns}
                filters={[]}
                searchKey=""
                loading={loading}
                filterOptions={[]}
            />
            <EnrollStudentDialog 
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

const columns: ColumnDef<DataTableFeatures, StudentT>[] = [
    {
        id: 'fullName',
        accessorKey: 'fullName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Full Name' />
        ),
        cell: ({ row }) => {
            const fullName = row.original.full_name
            const profile = row.original.media.find(md => md.media_type === "profile")
            return <div className="flex items-center gap-[0.5rem]">
                <Avatar className='h-10 w-10'>
                    <AvatarImage src={profile?.blob_url} alt={`${row.original.full_name} profile`} />
                    <AvatarFallback>{row.original?.first_name[0].toUpperCase()}{row.original?.last_name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{fullName}</span>
            </div>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: true
    },
    {
        id: "admission_number",
        accessorKey: 'admission_number',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Admission No.' />
        ),
        cell: ({ row }) => {
            const admissionNo = row.original.admission_number;
            return <LongText>{admissionNo}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "enrolled_at",
        accessorKey: 'enrolled_at',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Enrolled Date' />
        ),
        cell: ({ row }) => {
            const { id } = useParams()
            const enrolled_at = row.original.enrollments.filter(en => en.classroom_id === id).map(en => format(en.enrolled_at, 'do MMMM yyyy'))
            return (
                <div className="flex flex-col">
                    {enrolled_at ?? "N/A"}
                </div>
            )
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "gender",
        accessorKey: 'gender',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Gender' />
        ),
        cell: ({ row }) => {
            // const admissionNo = row.original.admission_number;
            return <LongText>{row.original.gender}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    }
]