import { PageWrapper } from "@/features/school/components";
import { useSearchParams } from "react-router-dom";
import { useSchoolClasses } from "../hooks";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import CreateRangeClassDialog from "../components/createRangeClassDialog";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import type { SchoolClassT } from "@/types/schoolClass";
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { LongText } from "@/components/ui/longText";
import CreateClassDialog from "../components/createClassDialog";

export default function Classes() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { selectedCampus } = useUserDefaultsProvider()
    const {
        isLoading: loading,
        data: classes,
        refetch
    } = useSchoolClasses(selectedCampus?.school_id ?? "", selectedCampus?.id ?? "")

    return (
        <PageWrapper
            title="Classes"
            description="Here you can create range of classes and manage classes"
            actions={[
                {
                    children: "Create Range",
                    size: "sm",
                    variant: "secondary",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "create-range")
                        setSearchParams(searchParams)
                    }
                },
                {
                    children: "Create Class",
                    size: "sm",
                    variant: "default",
                    type: "button",
                    onClick: () => {
                        searchParams.set("action", "create")
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={classes !== undefined ? classes : []}
                paginate={false}
                search={{}}
                totalRows={classes !== undefined ? classes.length : 0}
                columns={columns}
                loading={loading}
                filters={[]}
                searchKey=""
                // filterOptions={[
                //     {
                //         columnId: "department",
                //         title: "Department",
                //         options: selectedSchool !== null ? selectedSchool.departments.map(dep => {
                //             return {
                //                 label: dep.name,
                //                 value: dep.id
                //             }
                //         }) : []
                //     },
                // ]}
            />
            <CreateRangeClassDialog
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
                refetch={() => refetch()}
            />
            <CreateClassDialog
                handleOpenChange={(open) => {
                    if (!open) {
                        searchParams.delete("action")
                        setSearchParams(searchParams)
                    }
                }}
                refetch={() => refetch()}
            />
        </PageWrapper>
    )
}

const columns: ColumnDef<DataTableFeatures, SchoolClassT>[] = [
    {
        id: "name",
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => {
            const name = row.original.name;
            return <LongText>{name}</LongText>
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
        id: 'section',
        accessorKey: 'section',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Section' />
        ),
        cell: ({ row }) => {

            return <LongText>{row.original.section}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'capacity',
        accessorKey: 'capacity',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Capacity' />
        ),
        cell: ({ row }) => {

            return <LongText>{row.original.capacity}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    }
]