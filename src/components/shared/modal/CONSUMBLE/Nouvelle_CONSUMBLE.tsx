"use client";

import { useState } from "react";
import { FaBox, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicModal } from "../Modal";
import { createconsumableitem } from "@/app/api/tickets";

type Props = {
  onSuccess?: () => void;
};

export default function ConsumableModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [consumableData, setConsumableData] = useState({
    items: [{ type: "", quantity: 1 }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔹 Handle item field change
  const handleConsumableItemChange = (
    index: number,
    field: "type" | "quantity",
    value: string | number
  ) => {
    const updatedItems = [...consumableData.items];
    if (field === "type") {
      updatedItems[index][field] = value as string;
    } else {
      updatedItems[index][field] = value as number;
    }
    setConsumableData({ items: updatedItems });
  };

  // 🔹 Handle quantity +/- buttons
  const handleQuantityChange = (index: number, delta: number) => {
    const updatedItems = [...consumableData.items];
    updatedItems[index].quantity = Math.max(1, updatedItems[index].quantity + delta);
    setConsumableData({ items: updatedItems });
  };

  // 🔹 Remove item
  const handleRemoveConsumable = (index: number) => {
    const updatedItems = consumableData.items.filter((_, i) => i !== index);
    setConsumableData({ items: updatedItems });
  };

  // 🔹 Add new consumable item
  const handleAddConsumable = () => {
    setConsumableData((prev) => ({
      items: [...prev.items, { type: "", quantity: 1 }],
    }));
  };

  // 🔹 Submit form
  const handleSubmit = async () => {
    let newErrors: Record<string, string> = {};
    consumableData.items.forEach((item, i) => {
      if (!item.type) newErrors[`item-${i}-type`] = "Nom requis";
      if (!item.quantity || item.quantity < 1)
        newErrors[`item-${i}-quantity`] = "Quantité invalide";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      // Create each consumable item via API
      for (const item of consumableData.items) {
        await createconsumableitem(item.quantity, item.type);
      }
      
      console.log("✅ New consumables created successfully");
      
      // Reset form
      setConsumableData({ items: [{ type: "", quantity: 1 }] });
      
      // Call success callback to refresh parent table
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating consumables:', error);
      setErrors({ general: 'Erreur lors de la création des consommables. Veuillez réessayer.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
  

      <DynamicModal
        triggerLabel={<Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <FaBox />
          Nouveau consommable
        </Button>}
        open={open}
        onOpenChange={setOpen}
        title="Ajouter des consommables"
        description="Ajoutez les articles consommables avec leur quantité."
        confirmLabel={isLoading ? "Création..." : "Créer les consommables"}
        onConfirm={handleSubmit}
      >
        <div className="space-y-6">
          {/* Show general error if any */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}
          {consumableData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border p-3 rounded-lg shadow-sm bg-gray-50"
            >
              {/* Nom du consommable */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">
                  Nom du consommable :
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Papier thermique"
                  value={item.type}
                  disabled={isLoading}
                  onChange={(e) =>
                    handleConsumableItemChange(index, "type", e.target.value)
                  }
                />
                {errors[`item-${index}-type`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`item-${index}-type`]}
                  </p>
                )}
              </div>

              {/* Quantité */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-2">Quantité :</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    <FaMinus />
                  </Button>
                  <Input
                    type="number"
                    className="text-center w-20"
                    value={item.quantity}
                    min={1}
                    disabled={isLoading}
                    onChange={(e) =>
                      handleConsumableItemChange(index, "quantity", Number(e.target.value))
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleQuantityChange(index, 1)}
                  >
                    <FaPlus />
                  </Button>
                </div>
                {errors[`item-${index}-quantity`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`item-${index}-quantity`]}
                  </p>
                )}
              </div>

              {/* Supprimer */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  disabled={isLoading || consumableData.items.length <= 1}
                  onClick={() => handleRemoveConsumable(index)}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}

          {/* Ajouter un nouvel item */}
          <div className="flex justify-start">
            <Button
              type="button"
              onClick={handleAddConsumable}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <FaPlus /> Ajouter un article
            </Button>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
}
