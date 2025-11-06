// columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DeadStock } from "@/types/deadstock";
import { getConditionLabel } from "@/constants/deadstock/conditions";

// Columns for dead stock items (client view - read-only, no bank column)
export const createDeadStockColumns = (onRefresh: () => void): ColumnDef<DeadStock>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    header: "NOM DE L'ARTICLE",
    cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
  },
  {
    accessorKey: "quantity",
    header: "QUANTITÉ",
    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-600 font-semibold">
        {row.original.quantity}
      </Badge>
    ),
  },
  {
    accessorKey: "condition",
    header: "CONDITION",
    cell: ({ row }) => {
      const condition = row.original.condition;
      const conditionLabel = getConditionLabel(condition);
      const colorMap: Record<string, string> = {
        "NEW": "bg-green-100 text-green-700",
        "USED": "bg-blue-100 text-blue-700",
        "REFURBISHED": "bg-cyan-100 text-cyan-700",
        "DAMAGED": "bg-orange-100 text-orange-700",
        "OUT_OF_ORDER": "bg-red-100 text-red-700",
      };
      return (
        <Badge className={colorMap[condition] || "bg-gray-100 text-gray-700"}>
          {conditionLabel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "NOTES",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-xs block">
        {row.original.notes || "—"}
      </span>
    ),
  },
];

// Export the original columns for backward compatibility
export const DeadStockColumns = createDeadStockColumns(() => {});
