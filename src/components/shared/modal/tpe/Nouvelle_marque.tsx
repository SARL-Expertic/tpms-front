"use client";

import { useState } from "react";
import { FaIndustry, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicModal } from "../Modal";
import { createmanfacturer } from "@/app/api/tickets";

type Props = {
  onSuccess?: () => void;
};

export default function NewBrandModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [brandData, setBrandData] = useState({
    brandName: "",
    modelName: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔹 Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!brandData.brandName.trim()) {
      newErrors.brandName = "Le nom de la marque est requis";
    } else if (brandData.brandName.trim().length < 2) {
      newErrors.brandName = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!brandData.modelName.trim()) {
      newErrors.modelName = "Le nom du modèle est requis";
    } else if (brandData.modelName.trim().length < 2) {
      newErrors.modelName = "Le nom du modèle doit contenir au moins 2 caractères";
    }
    
    if (!brandData.description.trim()) {
      newErrors.description = "La description est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return false;

    try {
      setIsLoading(true);
      setErrors({});
      
      const manufacturerName = brandData.brandName.trim();
      const modelName = brandData.modelName.trim();
      const modelDescription = brandData.description.trim();
      
      await createmanfacturer(manufacturerName, modelName, modelDescription);

      
      // Reset form
      setBrandData({
        brandName: "",
        modelName: "",
        description: ""
      });
      
      // Call success callback to refresh parent table
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating brand:', error);
      setErrors({ general: 'Erreur lors de la création de la marque. Veuillez réessayer.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
  

      <DynamicModal
        triggerLabel={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <FaIndustry />
            Nouvelle Marque
          </Button>
        }
        open={open}
        onOpenChange={setOpen}
        title="Ajouter une nouvelle marque"
        description="Créez une nouvelle marque de terminaux de paiement."
        confirmLabel={isLoading ? "Création..." : "Créer la marque"}
        onConfirm={handleSubmit}
      >
        <div className="space-y-6 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <div className="text-lg font-semibold text-blue-700">Création de la marque en cours...</div>
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
          
          {/* Brand name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="brand-name">
              Nom de la marque <span className="text-red-500">*</span>
            </label>
            <Input
              id="brand-name"
              type="text"
              placeholder="Ex: Ingenico, Verifone, Pax..."
              value={brandData.brandName}
              disabled={isLoading}
              onChange={(e) => setBrandData({...brandData, brandName: e.target.value})}
              className={errors.brandName ? "border-red-500" : ""}
            />
            {errors.brandName && (
              <p className="text-red-500 text-sm">{errors.brandName}</p>
            )}
          </div>
          
          {/* Model name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="model-name">
              Nom du modèle <span className="text-red-500">*</span>
            </label>
            <Input
              id="model-name"
              type="text"
              placeholder="Ex: iCT220, VX820, A35..."
              value={brandData.modelName}
              disabled={isLoading}
              onChange={(e) => setBrandData({...brandData, modelName: e.target.value})}
              className={errors.modelName ? "border-red-500" : ""}
            />
            {errors.modelName && (
              <p className="text-red-500 text-sm">{errors.modelName}</p>
            )}
          </div>
          
          {/* Description input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Terminal de paiement Ingenico iCT220"
              value={brandData.description}
              disabled={isLoading}
              onChange={(e) => setBrandData({...brandData, description: e.target.value})}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> Vous créez une nouvelle marque avec son premier modèle. Vous pourrez ajouter d'autres modèles à cette marque par la suite.
            </p>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
}
