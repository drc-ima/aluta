import { DataTable, type DataTableFeatures } from "@/components/dataTable/table"
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider"
import { PageWrapper } from "@/features/school/components"
import { useAcademicYears } from "@/hooks/queries"
import { Link, useSearchParams } from "react-router-dom"
import CreateAcademicPeriodDialog from "../components/createAcademicPeriodDialog"
import type { ColumnDef } from "@tanstack/react-table"
import type { AcademicPeriodT } from "@/types/academicPeriod"
import { DataTableColumnHeader } from "@/components/dataTable/columnHeader"
import { LongText } from "@/components/ui/longText"
import { format } from "date-fns"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { CheckIcon, ChevronRight, PlusCircleIcon } from "lucide-react"
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function AcademicPeriods() {
    const { currentAcademicYear, loadingAcademicPeriods } = useUserDefaultsProvider()
    const [searchParams, setSearchParams] = useSearchParams()
    // const {
    //     isLoading: loading,
    //     data: academicYears,
    //     refetch
    // } = useAcademicYears(selectedCampus?.id!, selectedCampus?.school_id!)
    return (
        <PageWrapper
            title="Academic Terms"
            actions={[
                {
                    children: "Create Academic Term",
                    size: "sm",
                    type: "button",
                    onClick: () => {
                        searchParams.set("academic-period", "create")
                        searchParams.set("parent_id", currentAcademicYear?.id!)
                        setSearchParams(searchParams)
                    }
                }
            ]}
        >
            <DataTable
                data={currentAcademicYear !== undefined ? currentAcademicYear.children : []}
                paginate={false}
                search={{}}
                totalRows={currentAcademicYear !== undefined ? currentAcademicYear.children.length : 0}
                columns={columns}
                loading={loadingAcademicPeriods}
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

        </PageWrapper>
    )
}

const columns: ColumnDef<DataTableFeatures, AcademicPeriodT>[] = [
    {
        id: "name",
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Term' />
        ),
        cell: ({ row }) => {
            const name = row.original.name;
            return <LongText className='max-w-36 ps-3'>{name}</LongText>
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'start_date',
        accessorKey: 'start_date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Start Date' />
        ),
        cell: ({ row }) => {
            const startDate = row.original.start_date
            return <LongText>{format(startDate, "do MMMM yyyy")}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'end_date',
        accessorKey: 'end_date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='End Date' />
        ),
        cell: ({ row }) => {
            const endDate = row.original.end_date
            return <LongText>{format(endDate, "do MMMM yyyy")}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    },
    {
        id: 'duration',
        accessorKey: 'duration',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Duration' />
        ),
        cell: ({ row }) => {
            const { days, weeks } = row.original
            return <LongText>{days} days, {weeks} weeks</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        enableSorting: false
    },
    // {
    //     id: 'terms',
    //     accessorKey: 'terms',
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title='Terms' />
    //     ),
    //     cell: ({ row }) => {
    //         const children = row.original.children
    //         const [searchParam, setSearchParams] = useSearchParams()
    //         const { currentAcademicTerm } = useUserDefaultsProvider()
    //         return (
    //             <div className="flex flex-wrap gap-[0.5rem] items-center">
    //                 <Tooltip>
    //                     <TooltipTrigger asChild>
    //                         <Button

    //                             variant={"ghost"}
    //                             size={"icon"}
    //                             onClick={() => {
    //                                 searchParam.set("action", "create")
    //                                 searchParam.set("parent_id", row.original.id)
    //                                 setSearchParams(searchParam)
    //                             }}
    //                         >
    //                             <PlusCircleIcon />
    //                         </Button>
    //                     </TooltipTrigger>
    //                     <TooltipContent>
    //                         <p>Click to add academic term.</p>
    //                     </TooltipContent>
    //                 </Tooltip>

    //                 {
    //                     children.map((ay) => (
    //                         <Badge key={ay.id} variant={"outline"} className="flex gap-2 cursor-pointer">
    //                             <span>{ay.name}</span>
    //                             {
    //                                 currentAcademicTerm?.id! === ay.id && <CheckIcon />
    //                             }
    //                         </Badge>
    //                     ))
    //                 }
    //             </div>
    //         )
    //     },
    //     // meta: { className: 'w-36' },
    //     enableHiding: false,
    //     enableSorting: false
    // },
    // {
    //     id: "action",
    //     header: ({ column }) => {
    //         <DataTableColumnHeader column={column} title="" />
    //     },
    //     cell: ({ row }) => {
    //         return (
    //             <Link to={`/academics/${row.original.id}`}>
    //                 <ChevronRight />
    //             </Link>
    //         )
    //     }
    // }
]