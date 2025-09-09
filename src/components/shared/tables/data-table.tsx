'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useState, useMemo } from "react"

import { FilterConfig } from "@/types/tables/filter"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filters?: FilterConfig<TData>[]
  extra?: {
    refreshTable?: () => void
  }
}

export function DataTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  filters,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [filterState, setFilterState] = useState<Record<string, string>>({})

 // Filtered data logic
const filteredData = useMemo(() => {
  const result = data.filter((item) => {
    const matchesFilters = filters?.every(({ key }) => {
      const selected = filterState[key as string] ?? "all"
      return selected === "all" || item[key] === selected
    }) ?? true

    const matchesGlobal = globalFilter
      ? Object.values(item).some(val =>
          String(val).toLowerCase().includes(globalFilter.toLowerCase())
        )
      : true

    return matchesFilters && matchesGlobal
  })

  // ✅ Sort from newest to oldest
  return result.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateB.getTime() - dateA.getTime() // newest first
  })
}, [data, filterState, globalFilter, filters])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="rounded-2xl w-full shadow-md bg-white dark:bg-zinc-900 p-4 space-y-4">

      {/* 🔍 Global and Column Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Input
          placeholder="Recherche globale..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />

        <div className="flex flex-wrap gap-4">
        {filters?.map(({ key, placeholder,label }) => {
  const uniqueValues = Array.from(new Set(data.map((d) => d[key])))

  return (
    <Select
      key={String(key)}
      onValueChange={(value) =>
        setFilterState((prev) => ({ ...prev, [key]: value }))
      }
      value={filterState[key as string] ?? "all"}
      
    >
      <SelectTrigger className="w-fit px-4 ">
        {/* Always show placeholder text here */}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* "Tous" will be the first option */}
        <SelectItem value="all">{label} </SelectItem>

        {/* Actual distinct values */}
        {uniqueValues.map((val) => (
          <SelectItem key={String(val)} value={String(val)}>
            {String(val)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})}

        </div>
      </div>

      {/* 🧾 Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-muted-foreground">
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

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* 📄 Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
