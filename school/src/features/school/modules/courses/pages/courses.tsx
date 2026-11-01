import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { PageWrapper } from "@/features/school/components";
import { useSearchParams } from "react-router-dom";
import { useCourses } from "../hooks";
import CreateCourseDialog from "../components/createCourseDialog";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { CourseT } from "@/types/course";
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { LongText } from "@/components/ui/longText";

export default function Courses() {
    const { selectedSchool } = useUserDefaultsProvider();
    const [searchParams, setSearchParams] = useSearchParams();


    const filterConfig = [
        {
            columnId: "department",
            searchKey: "department",
            type: "array" as const
        }
    ]

    const tableState = useTableUrlState({
        search: {},
        columnFilters: filterConfig,
    })

    const {
        isLoading: loading,
        data: courses,
        refetch
    } = useCourses({
        school_id: selectedSchool !== null ? selectedSchool.id : "",
        params: {
            filters: tableState.columnFilters
        }
    })

    const search = Object.fromEntries(searchParams.entries());
    return (
        <PageWrapper
            title="Courses"
            actions={[
                {
                    children: "Create Course",
                    size: "sm",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "create")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={courses !== undefined ? courses : []}
                paginate={false}
                search={search}
                totalRows={courses !== undefined ? courses.length : 0}
                columns={columns}
                loading={loading}
                filters={filterConfig}
                searchKey=""
                filterOptions={[
                    {
                        columnId: "department",
                        title: "Department",
                        options: selectedSchool !== null ? selectedSchool.departments.map(dep => {
                            return {
                                label: dep.name,
                                value: dep.id
                            }
                        }) : []
                    },
                ]}
            />
            <CreateCourseDialog
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

const columns: ColumnDef<DataTableFeatures, CourseT>[] = [
    {
        id: "name",
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => {
            const staffNo = row.original.name;
            return <LongText className='max-w-36 ps-3'>{staffNo}</LongText>
        },
        // meta: {
        //     className: cn(
        //         'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        //         'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
        //     ),
        // },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'code',
        accessorKey: 'code',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Course Code' />
        ),
        cell: ({ row }) => {
            
            return <LongText className='max-w-36'>{row.original.code}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'department',
        accessorKey: 'department',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Department' />
        ),
        cell: ({ row }) => {
            const department = row.original.department.name

            
            return <LongText className='max-w-36'>{department}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        filterFn: (row, id, value) => {
            console.log(row, id, value)
            return value.includes(row.getValue(id))
        },
        enableSorting: false
    },
]