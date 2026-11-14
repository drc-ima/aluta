import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { useSearchParams } from "react-router-dom";
import { useSchoolGuardians, useSchoolStudents } from "../hooks";
import { useEffect, useState } from "react";
import { useTableUrlState } from "@/hooks/useTableUrlState";
import { PageWrapper } from "@/features/school/components";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { GuardianT } from "@/types/student";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { LongText } from "@/components/ui/longText";


export default function Guardians() {
    const { selectedCampus, selectedSchool } = useUserDefaultsProvider()

    const [searchParams, setSearchParams] = useSearchParams();

    const [studentSearch, setStudentSearch] = useState("")
    const {
        data: students
    } = useSchoolStudents(
        selectedCampus?.school_id!, 
        {
            search: studentSearch,
            filters: [
                {id: "campus", value: [selectedCampus?.id!]}
            ]
        }
    )

    const filterConfig = [
        {
            columnId: "student",
            searchKey: "student",
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
            columnId: "student",
            title: "Student",
            options: students?.items.map(cls => {
                return {
                    label: cls.full_name,
                    value: cls.id
                }
            }) || [],
            shouldFilter: false,
            searchValue: studentSearch,
            onValueChange: setStudentSearch
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
        data: guardians,
        refetch
    } = useSchoolGuardians(
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
            title="Guardians"
            description="Here you can admit and manage your guardians"
            actions={[
                {
                    children: "Create Guardian",
                    size: "sm",
                    onClick: () => {
                        searchParams.set("action", "create")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={guardians !== undefined ? guardians.items : []}
                totalRows={guardians !== undefined ? guardians.total : 0}
                search={search}
                filters={filterConfig}
                searchKey="search"
                loading={loading}
                searchPlaceholder="Search by guardian name"
                filterOptions={filterOptions}
                columns={columns}
            />
        </PageWrapper>
    )
}

const columns: ColumnDef<DataTableFeatures, GuardianT>[] = [
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
    {
        id: 'student',
        accessorKey: 'student',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Full Name' />
        ),
        cell: ({ row }) => {
            const fullName = row.original.full_name
    
            return <span className="font-medium">{fullName}</span>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: true
    },
    {
        id: "phone",
        accessorKey: 'phone',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Phone Number' />
        ),
        cell: ({ row }) => {
            const phone = row.original.phone;
            return <LongText>{phone}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: "campus",
        accessorKey: 'campus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Email Address' />
        ),
        cell: ({ row }) => {
            
            return <LongText>{row.original.email}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
]