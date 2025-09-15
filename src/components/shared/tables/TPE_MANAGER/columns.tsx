"use client";

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

// Type for TPE row
export type TPE = {
  id: string
  serialNumber: string
  type: string
  model: string
  manufacturer: string
  telecomOperator: string
  status: string
  bankId: string | number
  clientId: string | number
  purchaseDate?: string
  warrantyExpiry?: string
  updatedAt?: string
}

// Columns for TPEs
export const TPEColumns: ColumnDef<TPE>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span>{row.original.id}</span>,
  },
  {
    accessorKey: "serialNumber",
    header: "SN",
    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-600">
        {row.original.serialNumber}
      </Badge>
    ),
  },
  {
    accessorKey: "model",
    header: "MODÈLE",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <h1 className="font-semibold">{row.original.manufacturer}</h1>
        <h1>{row.original.model}</h1>
      </div>
    ),
  },
  {
    accessorKey: "telecomOperator",
    header: "OPÉRATEUR",
    cell: ({ row }) => <span>{row.original.telecomOperator}</span>,
  },
  {
    accessorKey: "status",
    header: "STATUT",
    cell: ({ row }) => {
      const status = row.original.status
      const colorMap: Record<string, string> = {
        "EN ATTENTE": "text-blue-500",
        "EN MAINTENANCE": "text-orange-500",
        "AU SATEM": "text-purple-500",
        "EN UTILISATION": "text-green-600",
      }
      return (
        <div className="flex items-center gap-2">
          <span
            className={`text-3xl flex items-center leading-none ${
              colorMap[status] || "text-gray-500"
            }`}
          >
            •
          </span>
          <span>{status}</span>
        </div>
      )
    },
  },


  {
    accessorKey: "purchaseDate",
    header: "ACHAT",
    cell: ({ row }) => <span>{row.original.purchaseDate || "-"}</span>,
  },
  {
    accessorKey: "warrantyExpiry",
    header: "GARANTIE",
    cell: ({ row }) => <span>{row.original.warrantyExpiry || "-"}</span>,
  },
  {
    accessorKey: "updatedAt",
    header: "MIS À JOUR",
    cell: ({ row }) => <span>{row.original.updatedAt || "-"}</span>,
  },
]
