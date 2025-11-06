"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { FaInfoCircle, FaDesktop, FaEdit, FaSave, FaTimes, FaIndustry, FaCogs } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { Update_model_terminal_type, Update_manufacturer_terminal_type } from "@/app/api/tickets";

type TPE = {
  id: string;
  serialNumber: string;
  type: string;
  model: string;
  manufacturer: string;
  telecomOperator: string;
  label: string;
  status: string;
  bankId: string | number;
  clientId: string | number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
  manufacturerId?: number;
  modelId?: number;
  modelDescription?: string;
};

type Props = {
  tpe: TPE;
  onSave?: (updatedTPE: TPE) => void;
  onUpdate?: () => void; // Alternative prop for refreshing without data
};

export function TPEDetailsButton({ tpe, onSave, onUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedTPE, setEditedTPE] = useState<TPE>({ ...tpe });
  const [originalTPE, setOriginalTPE] = useState<TPE>({ ...tpe });

  // Check if form has unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) {
      return false;
    }

    return (
      editedTPE.manufacturer !== originalTPE.manufacturer ||
      editedTPE.model !== originalTPE.model ||
      editedTPE.modelDescription !== originalTPE.modelDescription
    );
  }, [editedTPE, originalTPE, isEditing]);

  const resetModalState = () => {
    setShowUnsavedDialog(false);
    setIsEditing(false);
    setIsLoading(false);
    setEditedTPE({ ...tpe });
    setOriginalTPE({ ...tpe });
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
    setOriginalTPE({ ...editedTPE });
    setIsEditing(true);
  };

  const handleSave = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Update manufacturer if changed
      if (editedTPE.manufacturer !== originalTPE.manufacturer && editedTPE.manufacturerId) {
        await Update_manufacturer_terminal_type(editedTPE.manufacturerId, {
          manufacturer_name: editedTPE.manufacturer,
        });
      }

      // Update model if model name or description changed
      if (
        (editedTPE.model !== originalTPE.model || 
         editedTPE.modelDescription !== originalTPE.modelDescription) &&
        editedTPE.modelId &&
        editedTPE.manufacturerId
      ) {
        await Update_model_terminal_type(editedTPE.modelId, {
          manufacturer_id: editedTPE.manufacturerId,
          model_name: editedTPE.model,
          description: editedTPE.modelDescription || "",
        });
      }

      // Update parent component with new values
      if (onSave) {
        onSave(editedTPE);
      }
      
      // Call refresh callback
      if (onUpdate) {
        onUpdate();
      }
      
      setOriginalTPE({ ...editedTPE });
      setIsEditing(false);
      setShowUnsavedDialog(false);
      
      // Show success message
      setShowSuccessModal(true);
      
      return true;
    } catch (error) {
      console.error('Error updating TPE:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedTPE({ ...originalTPE });
    setIsEditing(false);
    setShowUnsavedDialog(false);
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

  const handleChange = (field: keyof TPE, value: string | number) => {
    setEditedTPE(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "EN ATTENTE": "bg-blue-100 text-blue-600",
      "EN MAINTENANCE": "bg-orange-100 text-orange-600",
      "AU SATEM": "bg-purple-100 text-purple-600",
      "EN UTILISATION": "bg-green-100 text-green-600",
    };
    return colorMap[status] || "bg-gray-100 text-gray-600";
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
        title={`TPE: ${tpe.manufacturer} ${tpe.model}`}
        description={`Informations détaillées du TPE #${tpe.id}`}
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
            <FaDesktop className="text-blue-600" /> 
            {tpe.manufacturer} {tpe.model}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
   

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Fabricant:</span>
              {isEditing ? (
                <Input
                  value={editedTPE.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="Nom du fabricant"
                  className="flex items-center gap-2"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <FaIndustry className="text-gray-500" />
                  <span className="font-semibold">{tpe.manufacturer}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Modèle:</span>
              {isEditing ? (
                <Input
                  value={editedTPE.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="Nom du modèle"
                  className="flex items-center gap-2"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  <FaCogs className="text-gray-500" />
                  <span>{tpe.model}</span>
                </div>
              )}
            </div>

            {(isEditing || (tpe.modelDescription && tpe.modelDescription !== "-")) && (
              <div className="md:col-span-2">
                <span className="text-sm text-muted-foreground block mb-1">Description du modèle:</span>
                {isEditing ? (
                  <Textarea
                    value={editedTPE.modelDescription || ""}
                    onChange={(e) => handleChange('modelDescription', e.target.value)}
                    placeholder="Description du modèle..."
                    rows={2}
                  />
                ) : (
                  <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {tpe.modelDescription || "Aucune description"}
                  </div>
                )}
              </div>
            )}

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Type:</span>
              <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {tpe.type}
              </div>
            </div>








            {tpe.purchaseDate && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Date d'achat:</span>
                <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {tpe.purchaseDate}
                </div>
              </div>
            )}

            {tpe.warrantyExpiry && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Fin de garantie:</span>
                <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {tpe.warrantyExpiry}
                </div>
              </div>
            )}

            {tpe.createdAt && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Créé le:</span>
                <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {tpe.createdAt}
                </div>
              </div>
            )}

            {tpe.updatedAt && (
              <div>
                <span className="text-sm text-muted-foreground block mb-1">Mis à jour le:</span>
                <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {tpe.updatedAt}
                </div>
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
        description="Des modifications non enregistrées existent pour ce TPE. Voulez-vous les enregistrer avant de fermer ?"
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-green-600">Succès</span>
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-700">
                  Les modifications ont été enregistrées avec succès!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowSuccessModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}