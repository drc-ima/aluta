import { useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'
import { useSearchParams } from 'react-router-dom'

// type SearchRecord = Record<string, unknown>

// export type NavigateFn = (opts: {
//   search:
//     | true
//     | SearchRecord
//     | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord)
//   replace?: boolean
// }) => void

export type UseTableUrlStateParams = {
  // search: any
  // navigate: NavigateFunction
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        // Optional transformers for custom types
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

type UseTableUrlStateReturn = {
  // Global filter
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  // Column filters
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  // Pagination
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  // Helpers
  ensurePageInRange: (
    pageCount: number,
    opts?: { resetTo?: 'first' | 'last' }
  ) => void
}

export function useTableUrlState(
  params: UseTableUrlStateParams
): UseTableUrlStateReturn {
  const {
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  const [search, setSearch] = useSearchParams();

  const pageKey = paginationCfg?.pageKey ?? ('page' as string)
  const pageSizeKey = paginationCfg?.pageSizeKey ?? ('pageSize' as string)
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? ('filter' as string)
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // Build initial column filters from the current search params
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      // const raw = (search as SearchRecord)[cfg.searchKey]
      const raw = search.get(cfg.searchKey)
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        // default to array type
        const value = (deserialize(raw) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, search])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  const pagination: PaginationState = useMemo(() => {
    // const rawPage = (search as SearchRecord)[pageKey]
    const rawPage = search.get(pageKey)
    // const rawPageSize = (search as SearchRecord)[pageSizeKey]
    const rawPageSize = search.get(pageSizeKey)
    const pageNum = typeof rawPage === 'number' ? rawPage : defaultPage
    const pageSizeNum =
      typeof rawPageSize === 'number' ? rawPageSize : defaultPageSize
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
  }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize
    search.set(pageKey, nextPage <= defaultPage ? "" : nextPage.toString())
    search.set(pageSizeKey, nextPageSize === defaultPageSize ? "" : nextPageSize.toString())
    setSearch(search)
    // navigate({
    //   search: (prev) => ({
    //     ...(prev as SearchRecord),
    //     [pageKey]: ,
    //     [pageSizeKey]:
    //       nextPageSize === defaultPageSize ? undefined : nextPageSize,
    //   }),
    // })
  }

  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = search.get(globalFilterKey)
    return typeof raw === 'string' ? raw : ''
  })

  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater(globalFilter ?? '')
              : updater
          const value = trimGlobal ? next.trim() : next
          setGlobalFilter(value)
          search.delete(pageKey)
          search.set(globalFilterKey, value ? value : "")
          setSearch(search)
          // navigate({
          //   search: (prev) => ({
          //     ...(prev as SearchRecord),
          //     [pageKey]: undefined,
          //     [globalFilterKey]: value ? value : undefined,
          //   }),
          // })
        }
      : undefined

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(next)

    const patch: Record<string, unknown> = {}

    for (const cfg of columnFiltersCfg) {
      const found = next.find((f) => f.id === cfg.columnId)
      const serialize = cfg.serialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value =
          typeof found?.value === 'string' ? (found.value as string) : ''
        patch[cfg.searchKey] =
          value.trim() !== '' ? serialize(value) : undefined
      } else {
        const value = Array.isArray(found?.value)
          ? (found!.value as unknown[])
          : []
        patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
      }
    }
    search.delete(pageKey)
    setSearch(search)

    // navigate({
    //   search: (prev) => ({
    //     ...(prev as SearchRecord),
    //     [pageKey]: undefined,
    //     ...patch,
    //   }),
    // })
  }

  const ensurePageInRange = (
    pageCount: number,
    opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
  ) => {
    const currentPage = search.get(pageKey)
    const pageNum = typeof currentPage === 'number' ? currentPage : defaultPage
    if (pageCount > 0 && pageNum > pageCount) {
      search.set(pageKey, opts.resetTo === 'last' ? pageCount.toString() : "")
      setSearch(search)
      // navigate({
      //   replace: true,
      //   search: (prev) => ({
      //     ...(prev as SearchRecord),
      //     [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
      //   }),
      // })
    }
  }

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}
