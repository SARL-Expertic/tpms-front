"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { DELETE_DEAD_STOCK } from "@/app/api/tickets";
import { DeadStock } from "@/types/deadstock";
import { getConditionLabel } from "@/constants/deadstock/conditions";

type Props = {
  deadStock: DeadStock;
  onDelete: () => void;
};

export function DeadStockDeleteButton({ deadStock, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await DELETE_DEAD_STOCK(deadStock.id);
      onDelete(); // Call onDelete to trigger table refresh
      return true; // This will close the modal
    } catch (error) {
      console.error('Error deleting dead stock:', error);
      alert('Erreur lors de la suppression de l\'article dead stock. Veuillez réessayer.');
      setIsDeleting(false);
      return false; // This will keep the modal open
    }
  };

  return (
    <DynamicModal
    BTNCOLOR="bg-red-600"
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
            Supprimer l'article dead stock ?
          </h3>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Article à supprimer :</div>
            <div className="font-medium text-gray-900">{deadStock.name}</div>
            <div className="text-sm text-gray-500">ID: {deadStock.id} • Quantité: {deadStock.quantity} • Condition: {getConditionLabel(deadStock.condition)}</div>
            {deadStock.bank && (
              <div className="text-sm text-gray-500 mt-1">Banque assignée: {deadStock.bank.name}</div>
            )}
          </div>
          
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <strong>⚠️ Attention :</strong> Cette action supprimera définitivement cet article dead stock 
            de votre inventaire. Cette action ne peut pas être annulée.
          </div>
        </div>
      </div>
    </DynamicModal>
  );
}
