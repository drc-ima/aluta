import { DataTableColumnHeader } from "@/components/dataTable/columnHeader";
import { DataTable, type DataTableFeatures } from "@/components/dataTable/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LongText } from "@/components/ui/longText";
import { PageWrapper } from "@/features/school/components";
import { cn } from "@/libs/utils";
import type { StaffT } from "@/types/staff";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";
import CreateStaffDialog from "../components/createStaffDialog";
import { useSchoolStaffs } from "../hooks";
import { useUserDefaultsProvider } from "@/contexts/userDefaultProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdownMenu";
import { Button } from "@/components/ui/button";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Trash2, UserIcon, UserPen } from "lucide-react";


export default function Staff() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { selectedSchool } = useUserDefaultsProvider()

    const {
        isLoading: loading,
        data: staffs,
        refetch
    } = useSchoolStaffs({ school_id: selectedSchool !== null ? selectedSchool?.id : "", enabled: selectedSchool !== null})

    return (
        <PageWrapper
            title="Staff"
            actions={[
                {
                    children: "Create Staff",
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
                data={staffs !== undefined ? staffs.items : []}
                columns={staffColumns}
                filters={[]}
                searchKey="staffNo"
                searchPlaceholder="Search by staff name"
            />
            <CreateStaffDialog
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

const staffColumns: ColumnDef<DataTableFeatures, StaffT>[] = [
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
        // meta: {
        //     className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
        // },
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
        id: "staffNo",
        accessorKey: 'staffNo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Staff No.' />
        ),
        cell: ({ row }) => {
            const staffNo = row.original.staff_no;
            return <LongText className='max-w-36 ps-3'>{staffNo}</LongText>
    },
        // meta: {
        //     className: cn(
        //         'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        //         'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
        //     ),
        // },
        enableHiding: false,
    },
    {
        id: 'fullName',
        accessorKey: 'fullName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Full Name' />
        ),
        cell: ({ row }) => {
            const { first_name, last_name, middle_name } = row.original.user
            const fullName = `${first_name}${middle_name ? " " + middle_name : ""} ${last_name}`
            return <LongText className='max-w-36'>{fullName}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false
    },
    {
        id: 'department',
        accessorKey: 'department',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Department' />
        ),
        cell: ({ row }) => {
            const departments = row.original.staff_departments

            if (departments.length === 0) {
                return "--"
            }
            const departmentName = departments[0].department.name
            return <LongText className='max-w-36'>{departmentName}</LongText>
        },
        // meta: { className: 'w-36' },
        enableHiding: false,
        filterFn: (row, id, value) => {
            console.log(row, id, value)
            return value.includes(row.getValue(id))
        }
    },
    {
        id: 'lineManager',
        accessorKey: 'lineManager',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Line Manager' />
        ),
        cell: ({ row }) => {
            const parent = row.original.parent

            if (parent === null) {
                return "--"
            }
            const { first_name, last_name, middle_name } = parent.user
            const fullName = `${first_name}${middle_name ? " " + middle_name : ""} ${last_name}`
            return <LongText className='max-w-36'>{fullName}</LongText>
        },
        // meta: { className: 'w-36' },
    },
    {
        id: 'location',
        accessorKey: 'location',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Location' />
        ),
        cell: ({ row }) => {
            const campuses = row.original.staff_campuses

            if (campuses.length === 0) {
                return "--"
            }
            const { name } = campuses[0].campus
            return <LongText className='max-w-36'>{name}</LongText>
        },
        // meta: { className: 'w-36' },
    },
    {
        id: 'jobTitle',
        accessorKey: 'jobTitle',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Job Title' />
        ),
        cell: ({ row }) => {
            const positions = row.original.staff_positions

            if (positions.length === 0) {
                return "--"
            }
            const topPosition = positions[0].position.name
            return <LongText className='max-w-36'>{topPosition}</LongText>
        },
        // meta: { className: 'w-36' },
    },
    {
        id: "actions",
        cell: DataTableRowActions
    }
]

function DataTableRowActions({ row }: {row: Row<DataTableFeatures, StaffT>}) {

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuItem
            onClick={() => {
              
            }}
          >
            Details
            <DropdownMenuShortcut>
              <UserIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              
            }}
            
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
