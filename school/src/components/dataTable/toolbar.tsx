import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { DataTableFacetedFilter } from './facetedFilter'
import { DataTableViewOptions } from './viewOptions'
import type {
  Table,
  RowData,
} from "@tanstack/react-table";
import type { DataTableFeatures } from './table'
import { DataTableFacetedFilter } from './facetedFilter';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type DataTableToolbarProps<TData extends RowData> = {
  table: Table<DataTableFeatures, TData>

  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[],
    shouldFilter?: boolean,
    searchValue?: string,
    onValueChange?: (search: string) => void
  }[],
  withHeader?: boolean
}

export function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
  withHeader= true,
}: DataTableToolbarProps<TData>) {
  const { columnFilters } = table.store.state
  const [searchParam, setSearchParam] = useSearchParams()
  const [searchValue, setSearchValue] = useState<string>(searchParam.get(searchKey ?? "term") ?? "")

  if(withHeader === false) {
    return (<></>)
  }
  const onSearchChange = (value: string) => {
    setSearchValue(value)
    if (value.length > 0) {
      searchParam.set(searchKey ?? "term", value)
      setSearchParam(searchParam)
    } else {
      searchParam.delete(searchKey ?? "term")
      setSearchParam(searchParam)
    }

  }

  const isFiltered =
    columnFilters.length > 0;
  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {searchKey && (
          <Input
            placeholder={searchPlaceholder ?? "Search..."}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-8 w-37.5 lg:w-62.5"
          />
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                shouldFilter={filter.shouldFilter}
                searchValue={filter.searchValue}
                onValueChange={filter.onValueChange}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters()
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ms-2 h-4 w-4 text-destructive!' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
