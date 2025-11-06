"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { FaInfoCircle, FaBox, FaEdit, FaSave, FaTimes, FaBuilding, FaLink, FaUnlink } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UPDATE_DEAD_STOCK, GET_DETAILS_DEAD_STOCK_ITEM, assgined_dead_stock_to_bank, remove_dead_stock_from_bank, fetchbanks } from "@/app/api/tickets";
import { DeadStock } from "@/types/deadstock";
import { CONDITION_OPTIONS, getConditionLabel } from "@/constants/deadstock/conditions";

type Props = {
  deadStock: DeadStock;
  onSave: () => void;
};

export function DeadStockDetailsButton({ deadStock, onSave }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showRemoveBankDialog, setShowRemoveBankDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedDeadStock, setEditedDeadStock] = useState<DeadStock>({ ...deadStock });
  const [originalDeadStock, setOriginalDeadStock] = useState<DeadStock>({ ...deadStock });
  const [availableBanks, setAvailableBanks] = useState<any[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [assigningBank, setAssigningBank] = useState(false);

  // Load dead stock details when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadDeadStockDetails();
      loadBanks();
    }
  }, [isModalOpen]);

  const loadDeadStockDetails = async () => {
    try {
      const response = await GET_DETAILS_DEAD_STOCK_ITEM(deadStock.id);
      const data = response.data;
      setEditedDeadStock(data);
      setOriginalDeadStock(data);
    } catch (error) {
      console.error("Error loading dead stock details:", error);
    }
  };

  const loadBanks = async () => {
    try {
      setIsLoadingBanks(true);
      const response = await fetchbanks();
      setAvailableBanks(response.data?.banks || []);
    } catch (error) {
      console.error("Error loading banks:", error);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) {
      return false;
    }

    return (
      editedDeadStock.name !== originalDeadStock.name ||
      editedDeadStock.quantity !== originalDeadStock.quantity ||
      editedDeadStock.condition !== originalDeadStock.condition ||
      editedDeadStock.notes !== originalDeadStock.notes
    );
  }, [editedDeadStock, originalDeadStock, isEditing]);

  const resetModalState = () => {
    setShowUnsavedDialog(false);
    setIsEditing(false);
    setIsLoading(false);
    setEditedDeadStock({ ...deadStock });
    setOriginalDeadStock({ ...deadStock });
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
    setOriginalDeadStock({ ...editedDeadStock });
    setIsEditing(true);
  };

  const handleSave = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Build update payload with only changed fields
      const updatePayload: Partial<{
        name: string;
        quantity: number;
        condition: string;
        notes: string;
      }> = {};

      if (editedDeadStock.name !== originalDeadStock.name) {
        updatePayload.name = editedDeadStock.name;
      }
      if (editedDeadStock.quantity !== originalDeadStock.quantity) {
        updatePayload.quantity = editedDeadStock.quantity;
      }
      if (editedDeadStock.condition !== originalDeadStock.condition) {
        updatePayload.condition = editedDeadStock.condition;
      }
      if (editedDeadStock.notes !== originalDeadStock.notes) {
        updatePayload.notes = editedDeadStock.notes;
      }

      // Only send request if there are changes
      if (Object.keys(updatePayload).length > 0) {
        await UPDATE_DEAD_STOCK(editedDeadStock.id, updatePayload);
      }
      
      onSave();
      setOriginalDeadStock({ ...editedDeadStock });
      setIsEditing(false);
      setShowUnsavedDialog(false);
      return true;
    } catch (error) {
      console.error('Error updating dead stock:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedDeadStock({ ...originalDeadStock });
    setIsEditing(false);
    setShowUnsavedDialog(false);
  };

  const handleChange = (field: keyof DeadStock, value: string | number) => {
    setEditedDeadStock(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleAssignBank = async (bankId: number) => {
    try {
      setAssigningBank(true);
      await assgined_dead_stock_to_bank(editedDeadStock.id, bankId);
      await loadDeadStockDetails();
      onSave();
    } catch (error) {
      console.error('Error assigning bank:', error);
    } finally {
      setAssigningBank(false);
    }
  };

  const handleRemoveBank = async () => {
    try {
      setAssigningBank(true);
      await remove_dead_stock_from_bank(editedDeadStock.id);
      await loadDeadStockDetails();
      setShowRemoveBankDialog(false);
      onSave();
    } catch (error) {
      console.error('Error removing bank:', error);
    } finally {
      setAssigningBank(false);
    }
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
      title={`Dead Stock: ${editedDeadStock.name}`}
      description={`Informations sur l'article #${editedDeadStock.id}`}
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
            Article Dead Stock
          </h2>
          
          <div className="grid gap-4">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">ID:</span>
              <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {editedDeadStock.id}
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Nom:</span>
              {isEditing ? (
                <Input
                  value={editedDeadStock.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nom de l'article"
                />
              ) : (
                <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {editedDeadStock.name}
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Quantité:</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedDeadStock.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  min="0"
                />
              ) : (
                <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {editedDeadStock.quantity}
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Condition:</span>
              {isEditing ? (
                <Select
                  value={editedDeadStock.condition}
                  onValueChange={(value) => handleChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="font-semibold p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {getConditionLabel(editedDeadStock.condition)}
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Notes:</span>
              {isEditing ? (
                <Textarea
                  value={editedDeadStock.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes sur l'article"
                  rows={3}
                />
              ) : (
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {editedDeadStock.notes || "Aucune note"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Assignment Section */}
        <div className="p-4 rounded-lg border bg-muted/20">
          <h3 className="text-md font-semibold flex items-center gap-2 mb-3">
            <FaBuilding className="text-green-600" />
            Assignation Banque
          </h3>
          
          <div className="space-y-3">
            {editedDeadStock.bank ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Banque actuelle:</p>
                    <p className="font-semibold">{editedDeadStock.bank.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {editedDeadStock.bank.id}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowRemoveBankDialog(true)}
                    disabled={assigningBank}
                    className="flex items-center gap-2"
                  >
                    <FaUnlink />
                    Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Aucune banque assignée</p>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => handleAssignBank(parseInt(value))}
                    disabled={assigningBank || isLoadingBanks}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionnez une banque" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBanks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {assigningBank && (
                  <p className="text-sm text-blue-600">Assignation en cours...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </DynamicModal>
      
      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={handleConfirmSaveAndClose}
        onDiscard={handleDiscardAndClose}
        onCancel={() => setShowUnsavedDialog(false)}
        title="Modifications non enregistrées"
        description="Des modifications non enregistrées existent pour ce consommable. Voulez-vous les enregistrer avant de fermer ?"
      />

      {/* Remove Bank Confirmation Dialog */}
      <UnsavedChangesDialog
        open={showRemoveBankDialog}
        onConfirm={handleRemoveBank}
        onDiscard={() => setShowRemoveBankDialog(false)}
        onCancel={() => setShowRemoveBankDialog(false)}
        title="Retirer la banque"
        description={`Êtes-vous sûr de vouloir retirer "${editedDeadStock.bank?.name}" de cet article de dead stock ?`}
        confirmLabel={assigningBank ? "Retrait..." : "Confirmer"}
        discardLabel="Annuler"
      />
    </>
  );
}
