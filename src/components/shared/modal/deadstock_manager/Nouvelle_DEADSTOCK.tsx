"use client";

import { useState, useEffect, useMemo } from "react";
import { FaBox, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicModal } from "../Modal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { CREATE_DEAD_STOCK, fetchbanks } from "@/app/api/tickets";
import { CONDITION_OPTIONS } from "@/constants/deadstock/conditions";

type Props = {
  onSuccess?: () => void;
};

export default function NewDeadStockModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBanks, setAvailableBanks] = useState<any[]>([]);
  const [justSubmitted, setJustSubmitted] = useState(false); // Flag to bypass unsaved changes check
  const [deadStockData, setDeadStockData] = useState({
    name: "",
    quantity: 1,
    condition: "NEW",
    notes: "",
    bank_id: undefined as number | undefined,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initial empty state for comparison
  const initialData = {
    name: "",
    quantity: 1,
    condition: "NEW",
    notes: "",
    bank_id: undefined as number | undefined,
    isActive: true,
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      deadStockData.name !== initialData.name ||
      deadStockData.quantity !== initialData.quantity ||
      deadStockData.condition !== initialData.condition ||
      deadStockData.notes !== initialData.notes ||
      deadStockData.bank_id !== initialData.bank_id ||
      deadStockData.isActive !== initialData.isActive
    );
  }, [deadStockData]);

  // Load banks when modal opens
  useEffect(() => {
    if (open) {
      loadBanks();
    }
  }, [open]);

  const loadBanks = async () => {
    try {
      const response = await fetchbanks();
      setAvailableBanks(response.data?.banks || []);
    } catch (error) {
      console.error("Error loading banks:", error);
    }
  };

  const handleChange = (field: keyof typeof deadStockData, value: string | number | boolean | undefined) => {
    setDeadStockData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuantityChange = (delta: number) => {
    setDeadStockData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  const resetForm = () => {
    setDeadStockData({
      name: "",
      quantity: 1,
      condition: "NEW",
      notes: "",
      bank_id: undefined,
      isActive: true,
    });
    setErrors({});
    setJustSubmitted(false); // Reset the flag
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      resetForm();
      return;
    }

    // If just submitted successfully, bypass unsaved changes check
    if (justSubmitted) {
      finalizeClose();
      return;
    }

    // Simply close without showing unsaved changes dialog
    // User can cancel anytime without confirmation
    finalizeClose();
  };

  const finalizeClose = () => {
    setShowUnsavedDialog(false);
    setOpen(false);
    resetForm();
  };

  const handleDiscardAndClose = () => {
    finalizeClose();
  };

  const handleSubmit = async () => {
    let newErrors: Record<string, string> = {};
    
    if (!deadStockData.name) newErrors.name = "Nom requis";
    if (!deadStockData.quantity || deadStockData.quantity < 1) newErrors.quantity = "Quantité invalide";
    if (!deadStockData.condition) newErrors.condition = "Condition requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      // Create dead stock item via API
      await CREATE_DEAD_STOCK({
        name: deadStockData.name,
        quantity: deadStockData.quantity,
        condition: deadStockData.condition,
        notes: deadStockData.notes,
        bankId: deadStockData.bank_id,
        isActive: deadStockData.isActive,
      });
      
      console.log("✅ New dead stock item created successfully");
      
      // Call success callback to refresh parent table
      if (onSuccess) {
        onSuccess();
      }
      
      // Mark as successfully submitted to bypass unsaved changes check
      setJustSubmitted(true);
      
      // Close all dialogs
      setShowUnsavedDialog(false);
      setOpen(false);
      
      // Reset form after closing
      setTimeout(() => {
        resetForm();
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error creating dead stock:', error);
      setErrors({ general: 'Erreur lors de la création de l\'article dead stock. Veuillez réessayer.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DynamicModal
        triggerLabel={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <FaBox />
            Nouvel article Dead Stock
          </Button>
        }
        open={open}
        onOpenChange={handleModalOpenChange}
        title="Ajouter un article Dead Stock"
        description="Ajoutez un nouvel article dead stock avec ses informations."
        confirmLabel={isLoading ? "Création..." : "Créer l'article"}
        onConfirm={handleSubmit}
      >
      <div className="space-y-6 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="text-lg font-semibold text-blue-700">Création de l'article en cours...</div>
              <div className="text-sm text-gray-600">Veuillez patienter, ne fermez pas cette fenêtre</div>
            </div>
          </div>
        )}
        
        {/* Show general error if any */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Nom de l'article */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">
            Nom de l'article :*
          </label>
          <Input
            type="text"
            placeholder="Ex: TPE Ingenico défectueux"
            value={deadStockData.name}
            disabled={isLoading}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Quantité */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Quantité :*</label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </Button>
            <Input
              type="number"
              className="text-center"
              value={deadStockData.quantity}
              min={1}
              disabled={isLoading}
              onChange={(e) => handleChange('quantity', Number(e.target.value) || 1)}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleQuantityChange(1)}
            >
              <FaPlus />
            </Button>
          </div>
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Condition */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Condition :*</label>
          <Select
            value={deadStockData.condition}
            onValueChange={(value) => handleChange('condition', value)}
            disabled={isLoading}
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
          {errors.condition && (
            <p className="text-red-500 text-xs mt-1">{errors.condition}</p>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Notes :</label>
          <Textarea
            placeholder="Notes supplémentaires sur l'article..."
            value={deadStockData.notes}
            disabled={isLoading}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Banque (optionnel) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Banque (optionnel) :</label>
          <Select
            value={deadStockData.bank_id?.toString() || "none"}
            onValueChange={(value) => handleChange('bank_id', value === "none" ? undefined : parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une banque (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune banque</SelectItem>
              {availableBanks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id.toString()}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={deadStockData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Article actif
          </label>
        </div>
        </div>
      </DynamicModal>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={handleSubmit}
        onDiscard={handleDiscardAndClose}
        onCancel={() => setShowUnsavedDialog(false)}
        title="Modifications non enregistrées"
        description="Vous avez des modifications non enregistrées. Voulez-vous créer cet article avant de fermer ?"
        confirmLabel={isLoading ? "Création..." : "Créer l'article"}
        discardLabel="Ignorer"
      />
    </>
  );
}