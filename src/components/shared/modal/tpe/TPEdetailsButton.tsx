"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { FaInfoCircle, FaDesktop, FaEdit, FaSave, FaTimes, FaIndustry, FaCogs } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
};

type Props = {
  tpe: TPE;
  onSave?: (updatedTPE: TPE) => void;
};

export function TPEDetailsButton({ tpe, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTPE, setEditedTPE] = useState<TPE>({ ...tpe });

  const handleSave = () => {
    if (onSave) {
      onSave(editedTPE);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTPE({ ...tpe });
    setIsEditing(false);
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
      title={`TPE: ${tpe.manufacturer} ${tpe.model}`}
      description={`Informations détaillées du TPE #${tpe.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-4 p-2">
        <div className="p-4 rounded-lg border bg-muted/20">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <FaDesktop className="text-blue-600" /> 
            {tpe.manufacturer} {tpe.model}
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
   

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Fabricant:</span>
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <FaIndustry className="text-gray-500" />
                <span className="font-semibold">{tpe.manufacturer}</span>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground block mb-1">Modèle:</span>
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <FaCogs className="text-gray-500" />
                <span>{tpe.model}</span>
              </div>
            </div>

            {tpe.label && tpe.label !== "-" && (
              <div className="md:col-span-2">
                <span className="text-sm text-muted-foreground block mb-1">Description:</span>
                <div className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded">
                  {tpe.label}
                </div>
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
  );
}