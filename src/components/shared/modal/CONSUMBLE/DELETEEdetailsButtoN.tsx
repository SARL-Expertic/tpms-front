"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { deleteconsumableitem } from "@/app/api/tickets";

type Consumable = {
  id: number;
  type: string;
  quantity: number;
};

type Props = {
  consumable: Consumable;
  onDelete: () => void;
};

export function ConsumableDeleteButton({ consumable, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteconsumableitem(consumable.id);
      onDelete(); // Call onDelete to trigger table refresh
      return true; // This will close the modal
    } catch (error) {
      console.error('Error deleting consumable:', error);
      alert('Erreur lors de la suppression du consommable. Veuillez réessayer.');
      setIsDeleting(false);
      return false; // This will keep the modal open
    }
  };

  return (
    <DynamicModal
    BTNCOLOR="red"
      triggerLabel={
        <Button
          size="sm"
          variant="destructive"
          className="flex cursor-pointer bg-red-600 hover:scale-110 items-center gap-2"
        >
          <FaTrash />
          Supprimer
        </Button>
      }
      title="Confirmer la suppression"
      description="Cette action ne peut pas être annulée"
      cancelLabel="Annuler"
      confirmLabel={isDeleting ? "Suppression..." : "Supprimer définitivement"}
      onConfirm={handleDelete}
    >
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <FaExclamationTriangle className="text-red-600 text-3xl" />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Supprimer le consommable ?
          </h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Consommable à supprimer :</div>
            <div className="font-medium text-gray-900">{consumable.type}</div>
            <div className="text-sm text-gray-500">ID: {consumable.id} • Quantité: {consumable.quantity}</div>
          </div>
          
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <strong>⚠️ Attention :</strong> Cette action supprimera définitivement ce consommable 
            de votre inventaire. Cette action ne peut pas être annulée.
          </div>
        </div>
      </div>
    </DynamicModal>
  );
}