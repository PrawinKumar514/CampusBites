// src/components/admin/orders/data-table.tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  Row,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (id: string) => void;
  selectedOrderId?: string | null;
}

export function DataTable<TData extends {id: string}, TValue>({
  columns,
  data,
  onRowClick,
  selectedOrderId
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([
        { id: 'createdAt', desc: true }
    ])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false, // This is the fix
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  })

  const statuses = ['confirmed', 'preparing', 'ready', 'completed'];
  const statusFilter: string[] = table.getColumn("status")?.getFilterValue() as any || [];

  return (
    <div>
        <div className="flex items-center py-4 gap-2">
            <Input
            placeholder="Filter by Customer Email..."
            value={(table.getColumn("userEmail")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("userEmail")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Status
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuCheckboxItem
                    checked={statusFilter.length === 0}
                    onCheckedChange={(value) => {
                         if (value) {
                            table.getColumn("status")?.setFilterValue([]);
                        }
                    }}
                 >
                    All
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {statuses.map((status) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={status}
                        className="capitalize"
                        checked={statusFilter.includes(status)}
                        onCheckedChange={(value) => {
                            const currentFilter = statusFilter;
                            let newFilter: string[];
                            if (value) {
                                newFilter = [...currentFilter, status];
                            } else {
                                newFilter = currentFilter.filter(s => s !== status);
                            }
                            table.getColumn("status")?.setFilterValue(newFilter.length > 0 ? newFilter : undefined);
                        }}
                    >
                        {status}
                    </DropdownMenuCheckboxItem>
                    )
                })}
            </DropdownMenuContent>
            </DropdownMenu>
      </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
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
                    data-state={row.original.id === selectedOrderId ? "selected" : ""}
                    onClick={() => onRowClick && onRowClick(row.original.id)}
                    className={cn(onRowClick && "cursor-pointer")}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
      </div>
    </div>
  )
}
