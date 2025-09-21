import { ColumnDef } from "@tanstack/react-table";
import { ConsumableDetailsButton } from "../../modal/CONSUMBLE/CONSUMBLEdetailsButton";
import { Button } from "@/components/ui/button";
import { FaTrash } from "react-icons/fa";

export type ConsumableRow = {
  id: number;
  name: string;
  quantity: number;   // total stock
  reserved: number;   // reserved stock
};

export const ConsumableColumns: ColumnDef<ConsumableRow>[] = [
  {
    accessorKey: "id",
    header: "Consumable ID",
  },
  {
    accessorKey: "name",
    header: "Consumable Name",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const consumable = row.original;

      return (
        <input
          type="number"
          className="w-20 border rounded px-2 py-1"
          value={consumable.quantity}
          onChange={(e) => {
            // TODO: API call to update quantity
            console.log("Update quantity", consumable.id, e.target.value);
          }}
        />
      );
    },
  },
  {
    accessorKey: "reserved",
    header: "Reserved",
    cell: ({ row }) => {
      const consumable = row.original;

      return (
        <input
          type="number"
          className="w-20 border rounded px-2 py-1"
          value={consumable.reserved}
          onChange={(e) => {
            // TODO: API call to update reserved
            console.log("Update reserved", consumable.id, e.target.value);
          }}
        />
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const consumable = row.original;

      return (
        <div className="flex items-center gap-2">
          <ConsumableDetailsButton consumable={consumable} />
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
            onClick={() => {
              // TODO: API call to remove consumable
              console.log("Remove consumable", consumable.id);
            }}
          >
            <FaTrash />
            Remove
          </Button>
        </div>
      );
    },
  },
];
