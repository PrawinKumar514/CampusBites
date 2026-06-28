// src/components/admin/orders/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { OrderWithUser } from "@/lib/types"
import { Timestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"

export const columns: ColumnDef<OrderWithUser>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="font-mono text-sm">{row.original.id.substring(0, 7)}</div>,
  },
  {
    accessorKey: "userEmail",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => <div>{row.original.userEmail}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = (row.original.createdAt as Timestamp)?.toDate();
        return <div>{date ? date.toLocaleDateString() : 'N/A'}</div>;
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <div className="text-right">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
     filterFn: (row, id, value) => {
      if (!value || value.length === 0) return true;
      return value.includes(row.getValue(id))
    },
  },
]
