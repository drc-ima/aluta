
import {
    useCallback,
    useMemo,
} from "react";
import {
    useSearchParams,
} from "react-router-dom";
import type {
    ColumnFiltersState,
    OnChangeFn,
    PaginationState,
    SortingState,
} from "@tanstack/react-table";

type SearchRecord = Record<string, unknown>;

export type UseTableUrlStateParams = {
    search: SearchRecord;
    pagination?: {
        pageKey?: string;
        pageSizeKey?: string;
        defaultPage?: number;
        defaultPageSize?: number;
    };
    columnFilters?: Array<
        | {
              columnId: string;
              searchKey: string;
              type?: "string";
              serialize?: (value: unknown) => unknown;
              deserialize?: (value: unknown) => unknown;
          }
        | {
              columnId: string;
              searchKey: string;
              type: "array";
              serialize?: (value: unknown) => unknown;
              deserialize?: (value: unknown) => unknown;
          }
    >;
    sorting?: {
        sortByKey?: string;
        sortOrderKey?: string;
        defaultSortBy?: string;
        defaultSortOrder?: "asc" | "desc";
    };
    searchKey?: string;
};

export function useTableUrlState({
    search,
    pagination: paginationConfig,
    columnFilters: filterConfig = [],
    sorting: sortingConfig,
    searchKey = "search",
}: UseTableUrlStateParams) {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageKey = paginationConfig?.pageKey ?? "page";
    const pageSizeKey = paginationConfig?.pageSizeKey ?? "limit";
    const defaultPage = paginationConfig?.defaultPage ?? 1;
    const defaultPageSize =
        paginationConfig?.defaultPageSize ?? 20;

    const sortByKey = sortingConfig?.sortByKey ?? "sortBy";
    const sortOrderKey =
        sortingConfig?.sortOrderKey ?? "sortOrder";
    const defaultSortBy = sortingConfig?.defaultSortBy ?? "id";
    const defaultSortOrder =
        sortingConfig?.defaultSortOrder ?? "asc";

    const pagination = useMemo<PaginationState>(() => {
        const page = Number(searchParams.get(pageKey));
        const limit = Number(searchParams.get(pageSizeKey));

        return {
            pageIndex:
                Number.isInteger(page) && page > 0
                    ? page - 1
                    : defaultPage - 1,
            pageSize:
                Number.isInteger(limit) && limit > 0
                    ? limit
                    : defaultPageSize,
        };
    }, [
        searchParams,
        pageKey,
        pageSizeKey,
        defaultPage,
        defaultPageSize,
    ]);

    const sorting = useMemo<SortingState>(() => {
        const sortBy = searchParams.get(sortByKey);
        const sortOrder = searchParams.get(sortOrderKey);

        if (!sortBy) return [];

        return [
            {
                id: sortBy,
                desc: sortOrder === "desc",
            },
        ];
    }, [searchParams, sortByKey, sortOrderKey]);

    const columnFilters = useMemo<ColumnFiltersState>(() => {
        return filterConfig.flatMap((config) => {
            const raw = searchParams.get(config.searchKey);

            if (!raw) return [];

            let value: any = raw;

            try {
                if (config.type === "array") {
                    value = JSON.parse(raw);
                }
            } catch {
                value = [];
            }

            value = config.deserialize
                ? config.deserialize(value)
                : value;

            if (config.type === "array") {
                return Array.isArray(value) && value.length
                    ? [{ id: config.columnId, value }]
                    : [];
            }

            return typeof value === "string" && value.trim()
                ? [{ id: config.columnId, value }]
                : [];
        });
    }, [searchParams, filterConfig]);

    const updateParams = useCallback(
        (patch: Record<string, unknown>, resetPage = false) => {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous);

                    for (const [key, value] of Object.entries(patch)) {
                        if (
                            value === undefined ||
                            value === null ||
                            value === ""
                        ) {
                            next.delete(key);
                        } else if (Array.isArray(value)) {
                            if (value.length === 0) {
                                next.delete(key);
                            } else {
                                next.set(key, JSON.stringify(value));
                            }
                        } else {
                            next.set(key, String(value));
                        }
                    }

                    if (resetPage) {
                        next.delete(pageKey);
                    }

                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams, pageKey]
    );

    const onPaginationChange: OnChangeFn<PaginationState> =
        useCallback(
            (updater) => {
                const next =
                    typeof updater === "function"
                        ? updater(pagination)
                        : updater;

                updateParams({
                    [pageKey]:
                        next.pageIndex + 1 === defaultPage
                            ? undefined
                            : next.pageIndex + 1,
                    [pageSizeKey]:
                        next.pageSize === defaultPageSize
                            ? undefined
                            : next.pageSize,
                });
            },
            [
                pagination,
                updateParams,
                pageKey,
                pageSizeKey,
                defaultPage,
                defaultPageSize,
            ]
        );

    const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> =
        useCallback(
            (updater) => {
                const next =
                    typeof updater === "function"
                        ? updater(columnFilters)
                        : updater;

                const patch: Record<string, unknown> = {};

                for (const config of filterConfig) {
                    const filter = next.find(
                        (item) => item.id === config.columnId
                    );

                    let value = filter?.value;

                    if (config.type === "array") {
                        value = Array.isArray(value) ? value : [];
                    } else {
                        value =
                            typeof value === "string" ? value : "";
                    }

                    if (config.serialize) {
                        value = config.serialize(value);
                    }

                    patch[config.searchKey] = value;
                }

                updateParams(patch, true);
            },
            [columnFilters, filterConfig, updateParams]
        );

    const onSortingChange: OnChangeFn<SortingState> =
        useCallback(
            (updater) => {
                const next =
                    typeof updater === "function"
                        ? updater(sorting)
                        : updater;

                const first = next[0];

                updateParams(
                    {
                        [sortByKey]:
                            first && first.id !== defaultSortBy
                                ? first.id
                                : undefined,
                        [sortOrderKey]:
                            first && first.desc !== (defaultSortOrder === "desc")
                                ? first.desc
                                    ? "desc"
                                    : "asc"
                                : undefined,
                    },
                    true
                );
            },
            [
                sorting,
                updateParams,
                sortByKey,
                sortOrderKey,
                defaultSortBy,
                defaultSortOrder,
            ]
        );

    const setSearchValue = useCallback(
        (value: string) => {
            updateParams({ [searchKey]: value.trim() || undefined }, true);
        },
        [updateParams, searchKey]
    );

    const ensurePageInRange = useCallback(
        (pageCount: number) => {
            if (pageCount <= 0) return;

            if (pagination.pageIndex >= pageCount) {
                updateParams(
                    {
                        [pageKey]: pageCount === defaultPage
                            ? undefined
                            : pageCount,
                    }
                );
            }
        },
        [
            pagination.pageIndex,
            pageKey,
            defaultPage,
            updateParams,
        ]
    );

    return {
        pagination,
        sorting,
        columnFilters,
        searchValue: String(search[searchKey] ?? searchParams.get(searchKey) ?? ""),
        onPaginationChange,
        onColumnFiltersChange,
        onSortingChange,
        setSearchValue,
        ensurePageInRange,
    };
}
