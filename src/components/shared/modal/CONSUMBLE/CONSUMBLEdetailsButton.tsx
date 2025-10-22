"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { FaInfoCircle, FaBox, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { updateconsumableitem } from "@/app/api/tickets";

type Consumable = {
  id: number;
  type: string;
  quantity: number;

};

type Props = {
  consumable: Consumable;
  onSave: () => void;
};

export function ConsumableDetailsButton({ consumable, onSave }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedConsumable, setEditedConsumable] = useState<Consumable>({ ...consumable });
  const [originalConsumable, setOriginalConsumable] = useState<Consumable>({ ...consumable });

  useEffect(() => {
    if (!isEditing) {
      setEditedConsumable({ ...consumable });
      setOriginalConsumable({ ...consumable });
    }
  }, [consumable, isEditing]);

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) {
      return false;
    }

    return (
      editedConsumable.type !== originalConsumable.type ||
      editedConsumable.quantity !== originalConsumable.quantity
    );
  }, [editedConsumable, originalConsumable, isEditing]);

  const resetModalState = () => {
    setShowUnsavedDialog(false);
    setIsEditing(false);
    setIsLoading(false);
    setEditedConsumable({ ...consumable });
    setOriginalConsumable({ ...consumable });
  };

  const finalizeClose = () => {
    resetModalState();
    setIsModalOpen(false);
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setIsModalOpen(true);
      resetModalState();
      return;
    }

    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
      return;
    }

    finalizeClose();
  };

  const handleStartEditing = () => {
    setOriginalConsumable({ ...consumable });
    setEditedConsumable({ ...consumable });
    setIsEditing(true);
  };

  const handleSave = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await updateconsumableitem(editedConsumable.id, editedConsumable.quantity, editedConsumable.type);
      onSave();
      setOriginalConsumable({ ...editedConsumable });
      setIsEditing(false);
      setShowUnsavedDialog(false);
      return true;
    } catch (error) {
      console.error('Error updating consumable:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedConsumable({ ...originalConsumable });
    setIsEditing(false);
    setShowUnsavedDialog(false);
  };

  const handleChange = (field: keyof Consumable, value: string | number) => {
    setEditedConsumable(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleConfirmSaveAndClose = async () => {
    if (isLoading) {
      return;
    }

    const saved = await handleSave();
    if (saved) {
      finalizeClose();
    }
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedDialog(false);
    finalizeClose();
  };

  return (
    <>
      <DynamicModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        triggerLabel={
        <Button
          size="sm"
          className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2"
        >
          <FaInfoCircle className="text-lg" />
          Détails
        </Button>
      }
      title={`Consommable: ${consumable.type}`}
      description={`Informations sur le consommable #${consumable.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-4 p-2">
        {/* Edit/Save buttons */}
        <div className="flex justify-end gap-2 border-b pb-2">
          {!isEditing ? (
            <Button 
              onClick={handleStartEditing} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <FaEdit />
              Modifier
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
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
            </>
          )}
        </div>
        
        <div className="p-4 rounded-lg border bg-muted/20">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <FaBox className="text-blue-600" /> 
            {isEditing ? (
              <Input
                value={editedConsumable.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="text-lg font-bold"
                placeholder="Type de consommable"
              />
            ) : (
              editedConsumable.type
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
                  {editedConsumable.quantity}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </DynamicModal>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={handleConfirmSaveAndClose}
        onDiscard={handleDiscardAndClose}
        onCancel={() => setShowUnsavedDialog(false)}
        title="Modifications non enregistrées"
        description="Des modifications non enregistrées existent pour ce consommable. Voulez-vous les enregistrer avant de fermer ?"
      />
    </>
  );
}