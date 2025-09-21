"use client";

import { useState } from "react";
import { FaBox, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicModal } from "../Modal";

export default function ConsumableModal() {
  const [open, setOpen] = useState(false);
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
    updatedItems[index][field] = value;
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
  const handleSubmit = () => {
    let newErrors: Record<string, string> = {};
    consumableData.items.forEach((item, i) => {
      if (!item.type) newErrors[`item-${i}-type`] = "Nom requis";
      if (!item.quantity || item.quantity < 1)
        newErrors[`item-${i}-quantity`] = "Quantité invalide";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("✅ New consumables:", consumableData);
    setOpen(false);
  };

  return (
    <div>
  

      <DynamicModal
        triggerLabel='Nouveau consommable'
        open={open}
        onOpenChange={setOpen}
        title="Ajouter des consommables"
        description="Ajoutez les articles consommables avec leur quantité."
        onConfirm={handleSubmit}
      >
        <div className="space-y-6">
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
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    <FaMinus />
                  </Button>
                  <Input
                    type="number"
                    className="text-center w-20"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      handleConsumableItemChange(index, "quantity", Number(e.target.value))
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
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
