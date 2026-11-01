
import { useEffect, useState } from "react";
import {
    useTable,
    type ColumnDef,
    type RowData,
    tableFeatures,
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
} from "@tanstack/react-table";

import { cn } from "@/libs/utils";
import {
    useTableUrlState,
    type UseTableUrlStateParams,
} from "@/hooks/useTableUrlState";

import { DataTableToolbar } from "@/components/dataTable/toolbar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/dataTable/pagination";
// import { DataTableBulkActions } from "@/components/dataTable/dataTableBulkActions";

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

type ToolbarFilter = {
    columnId: string;
    title: string;
    options: { label: string; value: string }[];
};

type Props<TData extends RowData> = {
    data: TData[];
    totalRows: number;
    paginate?: boolean;
    loading?: boolean;
    search: Record<string, unknown>;
    columns: ColumnDef<DataTableFeatures, TData>[];
    filters: UseTableUrlStateParams["columnFilters"];
    searchKey: string;
    searchPlaceholder?: string;
    filterOptions?: ToolbarFilter[];
    setReactTable?: (table: any) => void
};

export function DataTable<TData extends RowData>({
    data,
    totalRows,
    loading = false,
    paginate = true,
    search,
    columns,
    filters,
    searchKey,
    searchPlaceholder = "",
    filterOptions = [],
    setReactTable
}: Props<TData>) {
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<
        Record<string, boolean>
    >({});

    const {
        pagination,
        sorting,
        columnFilters,
        onPaginationChange,
        onSortingChange,
        onColumnFiltersChange,
        ensurePageInRange,
    } = useTableUrlState({
        search,
        searchKey,
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
        columnFilters: filters,
    });

    const table = useTable<DataTableFeatures, TData>({
        features: dataTableFeatures,
        columns,
        data,

        // The API has already processed these operations.
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        rowCount: totalRows,

        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,
            columnVisibility,
        },

        onSortingChange,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange,
        onPaginationChange,
    });

    const pageCount = table.getPageCount();

    useEffect(() => {
        ensurePageInRange(pageCount);
    }, [pageCount, pagination.pageIndex, ensurePageInRange]);

    useEffect(() => {
        if(setReactTable) {
            setReactTable(table)
        }
    }, [])

    return (
        <div
            className={cn(
                "flex flex-1 flex-col gap-4",
                'max-sm:has-[div[role="toolbar"]]:mb-16'
            )}
        >
            <DataTableToolbar
                table={table}
                searchPlaceholder={searchPlaceholder}
                searchKey={searchKey}
                filters={filterOptions}
            />

            {loading && (
                <p className="text-sm text-muted-foreground">
                    Loading results...
                </p>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={cn(
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
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody className="">
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
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
                                    className="h-24 text-center"
                                >
                                    {loading
                                        ? "Loading..."
                                        : "No results."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {
                paginate && <DataTablePagination
                    table={table}
                    className="mt-auto"
                />
            }


            {/* <DataTableBulkActions table={table} /> */}
        </div>
    );
}
