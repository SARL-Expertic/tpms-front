import { ColumnDef } from "@tanstack/react-table";
import { ConsumableDetailsButton } from "../../modal/CONSUMBLE/CONSUMBLEdetailsButton";
import { ConsumableDeleteButton } from "../../modal/CONSUMBLE/DELETEEdetailsButtoN";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSave, FaTimes, FaEdit } from "react-icons/fa";
import { useState } from "react";

export type ConsumableRow = {
  id: number;
  type: string;
  quantity: number;
  minStock?: number;
  category?: string;
  lastRestocked?: string;
  onRefresh?: () => void;
};

const EditableQuantityCell = ({ consumable }: { consumable: ConsumableRow }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(consumable.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // TODO: API call to update quantity
      console.log("Update quantity", consumable.id, tempQuantity);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      consumable.onRefresh?.();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setTempQuantity(consumable.quantity);
    setIsEditing(false);
  };

  const isLowStock = consumable.quantity <= (consumable.minStock || 10);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="w-20"
          value={tempQuantity}
          onChange={(e) => setTempQuantity(Number(e.target.value))}
          disabled={isUpdating}
          min="0"
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          <FaSave className="text-sm" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel}
          disabled={isUpdating}
          className="h-8 w-8 p-0"
        >
          <FaTimes className="text-sm" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isLowStock ? "destructive" : "secondary"}
        className={isLowStock ? "animate-pulse" : ""}
      >
        {consumable.quantity}
        {isLowStock && " ⚠️"}
      </Badge>
     
    </div>
  );
};

export const ConsumableColumns: ColumnDef<ConsumableRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-gray-600">#{row.original.id}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Nom du Consommable",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.type}</div>
        {row.original.category && (
          <div className="text-sm text-gray-500">{row.original.category}</div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Stock Actuel",
    cell: ({ row }) => <EditableQuantityCell consumable={row.original} />,
  },
  {
    accessorKey: "minStock",
    header: "Stock Minimum",
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.minStock || 10}</span>
    ),
  },
  {
    accessorKey: "lastRestocked",
    header: "Dernier Réappro.",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {row.original.lastRestocked 
          ? new Date(row.original.lastRestocked).toLocaleDateString('fr-FR')
          : "N/A"
        }
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const consumable = row.original;

      return (
        <div className="flex items-center gap-2">
          <ConsumableDetailsButton 
            consumable={consumable} 
            onSave={consumable.onRefresh} 
          />
          <ConsumableDeleteButton 
            consumable={consumable} 
            onDelete={consumable.onRefresh} 
          />
        </div>
      );
    },
  },
];