"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { FaInfoCircle, FaBox, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";

type Consumable = {
  id: number;
  name: string;
  quantity: number;
};

type Props = {
  consumable: Consumable;
  onSave: (updatedConsumable: Consumable) => void;
};

export function ConsumableDetailsButton({ consumable, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedConsumable, setEditedConsumable] = useState<Consumable>({ ...consumable });

  const handleSave = () => {
    onSave(editedConsumable);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedConsumable({ ...consumable });
    setIsEditing(false);
  };

  const handleChange = (field: keyof Consumable, value: string | number) => {
    setEditedConsumable(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  return (
    <DynamicModal
      triggerLabel={
        <Button
          size="sm"
          className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2"
        >
          <FaInfoCircle className="text-lg" />
          Détails
        </Button>
      }
      title={
        <div className="flex items-center justify-between">
          <span>Consommable: {consumable.name}</span>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <FaEdit />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave />
                Enregistrer
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <FaTimes />
                Annuler
              </Button>
            </div>
          )}
        </div>
      }
      description={`Informations sur le consommable #${consumable.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-4 p-2">
        <div className="p-4 rounded-lg border bg-muted/20">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <FaBox className="text-blue-600" /> 
            {isEditing ? (
              <Input
                value={editedConsumable.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="text-lg font-bold"
              />
            ) : (
              consumable.name
            )}
          </h2>
          
          <div className="grid gap-4">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">ID:</span>
              <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {consumable.id}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Quantité:</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedConsumable.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  min="0"
                />
              ) : (
                <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {consumable.quantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DynamicModal>
  );
}