import { useTableUrlState, type UseTableUrlStateParams } from "@/hooks/useTableUrlState"
import { useEffect, useState } from "react"
import {
    useTable,
    type ColumnDef,
    tableFeatures,
    createCoreRowModel,
    createFacetedRowModel,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    flexRender,
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    columnFacetingFeature,
    rowSelectionFeature,
    columnVisibilityFeature,
    createFacetedUniqueValues,
    type ColumnFilter,
    type TableFeatures,
    type RowData,
    type CellData,

} from '@tanstack/react-table'
import { cn } from "@/libs/utils"
import { DataTableToolbar } from "@/components/dataTable/toolbar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/dataTable/pagination"
import { DataTableBulkActions } from "@/components/dataTable/dataTableBulkActions"


export const dataTableFeatures = tableFeatures({
    rowSelectionFeature,
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    columnFacetingFeature,
    columnVisibilityFeature,

    filteredRowModel: createFilteredRowModel(),
    facetedRowModel: createFacetedRowModel(),
    facetedUniqueValues: createFacetedUniqueValues(),
    paginatedRowModel: createPaginatedRowModel(),
    sortedRowModel: createSortedRowModel(),
});

export type DataTableFeatures = typeof dataTableFeatures;

// type UrlFilter = {
//     id: string;
//     value: unknown;
//     columnId: string;
//     type?: string;
//     searchKey: string;
//     serialize?: (value: unknown) => unknown;
//     deserialize?: (value: unknown) => unknown;
// };

type ToolbarFilter = {
    columnId: string;
    title: string;
    options: Array<{
        label: string;
        value: string;
    }>;
};

export type DataTableProps<TData extends RowData> = {
    data: TData[]
    columns: ColumnDef<DataTableFeatures, TData>[];
    filters: UseTableUrlStateParams["columnFilters"];
    toolbarFilters?: ToolbarFilter[];
    searchKey: string,
    filterOptions?: {
        columnId: string,
        title: string,
        options: { label: string, value: string }[],
        icon?: any
    }[],
    searchPlaceholder?: string
}
export type VisibilityState = Record<string, boolean>;
export interface ColumnSort {
    desc: boolean;
    id: string;
}
export type SortingState = ColumnSort[];

export function DataTable<TData extends RowData>({ data, columns, filters, searchKey, toolbarFilters = [], filterOptions = [], searchPlaceholder }:
    DataTableProps<TData>) {
    // Local UI-only states
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    const {
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    } = useTableUrlState({
        pagination: {
            defaultPage: 1,
            defaultPageSize: 20,
        },
        globalFilter: {
            enabled: false,
        },
        columnFilters: filters,
    });

    const table = useTable<DataTableFeatures, TData>({
        features: dataTableFeatures,
        columns,
        data,
        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,

            columnVisibility,
        },
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange,
        onPaginationChange,
        // getRowId: (row) => row,
    });

    const pageCount = table.getPageCount();


    useEffect(() => {
        ensurePageInRange(pageCount);
    }, [pageCount, pagination.pageIndex, ensurePageInRange]);


    return (
        <div
            className={cn(
                'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
                'flex flex-1 flex-col gap-4'
            )}
        >
            <DataTableToolbar
                table={table}
                searchPlaceholder={searchPlaceholder ?? ""}
                searchKey={searchKey}
                filters={filterOptions}
            />
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='group/row'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(
                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                header.column.columnDef.meta?.className,
                                                header.column.columnDef.meta?.thClassName
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className='group/row'
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                                                cell.column.columnDef.meta?.className,
                                                cell.column.columnDef.meta?.tdClassName
                                            )}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} className='mt-auto' />
            <DataTableBulkActions table={table} />
        </div>
    )
}


