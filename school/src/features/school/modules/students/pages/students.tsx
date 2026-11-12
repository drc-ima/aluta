import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { useSearchParams } from "react-router-dom";
import { useSchoolStudents } from "../hooks";
import { PageWrapper } from "@/features/school/components";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import { useSchoolClasses } from "../../classes/hooks";
import type { ColumnDef } from "@tanstack/react-table";
import type { StudentT } from "@/types/student";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { LongText } from "@/components/ui/longText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import { format } from "date-fns";
import CreateStudentDialog from "../components/createStudentDialog";

export default function Students() {
    const { selectedCampus, selectedSchool } = useUserDefaultsProvider()

    const [searchParams, setSearchParams] = useSearchParams();

    const {
        data: classes
    } = useSchoolClasses(selectedCampus?.school_id!, selectedCampus?.id!)

    const filterConfig = [
        {
            columnId: "classroom",
            searchKey: "classroom",
            type: "array" as const
        },
        {
            columnId: "gender",
            searchKey: "gender",
            type: "array" as const
        },
        {
            columnId: "campus",
            searchKey: "campus",
            type: "array" as const
        }
    ]

    const tableState = useTableUrlState({
        search: {},
        searchKey: "search",
        pagination: {
            defaultPage: 1,
            defaultPageSize: 20,
            pageKey: "page",
            pageSizeKey: "limit",
        },
        sorting: {
            sortByKey: "sortBy",
            sortOrderKey: "sortOrder",
            defaultSortBy: "id",
            defaultSortOrder: "asc",
        },
        columnFilters: filterConfig,
    });

    const filterOptions = [
        {
            columnId: "classroom",
            title: "Classroom",
            options: classes?.map(cls => {
                return {
                    label: `${cls.name} ${cls.section ?? ""}`,
                    value: cls.id
                }
            }) || []
        },
        {
            columnId: "gender",
            title: "Gender",
            options: [
                { "label": "Male", value: "Male" },
                { "label": "Female", value: "Female" }
            ]
        },
        {
            columnId: "campus",
            title: "Location",
            options: selectedSchool?.campuses.map((campus) => {
                return {
                    label: campus.name, value: campus.id
                }
            }) || []
        }
    ]

    const {
        isLoading: loading,
        data: students,
        refetch
    } = useSchoolStudents(
        selectedSchool?.id!,
        {
            page: tableState.pagination.pageIndex + 1,
            limit: tableState.pagination.pageSize,
            search: searchParams.get("search") ?? "",
            filters: tableState.columnFilters,
            sorting: tableState.sorting
        }
    )

    useEffect(() => {
        if (!selectedCampus) return
        searchParams.set("campus", `["${selectedCampus.id}"]`)
        setSearchParams(searchParams)
    }, [selectedCampus])

    const search = Object.fromEntries(searchParams.entries());

    return (
        <PageWrapper
            title="Students"
            description="Here you can admit and manage your students."
            actions={[
                {
                    children: "New Admission",
                    size: "sm",
                    onClick: () => {
                        searchParams.set("action", "create")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={students !== undefined ? students.items : []}
                totalRows={students !== undefined ? students.total : 0}
                search={search}
                filters={filterConfig}
                searchKey="search"
                loading={loading}
                searchPlaceholder="Search by student name"
                filterOptions={filterOptions}
                columns={columns}
            />
            <CreateStudentDialog
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

const columns: ColumnDef<DataTableFeatures, StudentT>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-0.5"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-0.5'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // {
    //     id: "media",
    //     cell: ({ row }) => {
    //         const profile = row.original.media.find(md => md.media_type === "profile")
    //         return (
    //             <Avatar className='h-8 w-8'>
    //                 <AvatarImage src={profile?.blob_url} alt={`${row.original.full_name} profile`} />
    //                 <AvatarFallback>{row.original?.first_name[0].toUpperCase()}{row.original?.last_name[0].toUpperCase()}</AvatarFallback>
    //             </Avatar>
    //         )
    //     }
    // },
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
        id: "admission_date",
        accessorKey: 'admission_date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Admission Date' />
        ),
        cell: ({ row }) => {
            const admissionNo = format(row.original.admission_date, "do MMMM yyyy");
            return <LongText>{admissionNo}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "classroom",
        accessorKey: 'classroom',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Classroom' />
        ),
        cell: ({ row }) => {
            const classNames = row.original.enrollments.filter(en => en.left_at === null).map(en => `${en.classroom.school_class.name} ${en.classroom.school_class.section ?? ""}`)
            return (
                <div className="flex flex-col">
                    {
                        classNames.map((cn => (
                            <span key={cn}>{cn}</span>
                        )))
                    }
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
    },
    {
        id: "campus",
        accessorKey: 'campus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='School Location' />
        ),
        cell: ({ row }) => {
            // const admissionNo = row.original.admission_number;
            return <LongText>{row.original.campus.name}</LongText>
        },
        enableHiding: true,
        enableSorting: false,
    },
]