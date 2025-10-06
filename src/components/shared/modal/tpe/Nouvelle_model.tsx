"use client";

import { useState, useEffect } from "react";
import { FaCog, FaIndustry } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DynamicModal } from "../Modal";
import { createModel, terminaltypesfetch } from "@/app/api/tickets";
// TODO: Import model creation API
// import { createModel } from "@/app/api/tickets";

type Props = {
  onSuccess?: () => void;
};

type TPEBrand = {
  manufacturer: string;
  manufacturer_id: number;

  models: { id: number; model: string; description?: string; }[];
};

export default function NewModelModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [availableBrands, setAvailableBrands] = useState<TPEBrand[]>([]);
  const [modelData, setModelData] = useState({
    manufacturer_id: "",
    model_name: "",
    description: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load available brands/manufacturers
  useEffect(() => {
    async function loadBrands() {
      try {
        setLoadingBrands(true);
        const response = await terminaltypesfetch();
        setAvailableBrands(response.data || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setErrors({ general: "Erreur lors du chargement des marques" });
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);

  // Get manufacturer ID from manufacturer name using the API data
  const getManufacturerId = (manufacturerName: string): number | null => {
    const selectedBrand = availableBrands.find(brand => brand.manufacturer === manufacturerName);
    return selectedBrand ? selectedBrand.manufacturer_id : null;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!modelData.manufacturer_id) {
      newErrors.manufacturer_id = "Veuillez sélectionner une marque";
    }
    if (!modelData.model_name.trim()) {
      newErrors.model_name = "Le nom du modèle est requis";
    } else if (modelData.model_name.trim().length < 2) {
      newErrors.model_name = "Le nom doit contenir au moins 2 caractères";
    }
    if (!modelData.description.trim()) {
      newErrors.description = "La description est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return false;

    try {
      setIsLoading(true);
      setErrors({});
      
      const manufacturerId = parseInt(modelData.manufacturer_id);
      if (!manufacturerId) {
        setErrors({ general: "Erreur: ID de marque non trouvé" });
        return false;
      }

      const payload = {
        manufacturer_id: manufacturerId,
        model_name: modelData.model_name.trim(),
        description: modelData.description.trim()
      };

      await createModel(payload);
      console.log("✅ New model created:", payload);
      // Reset form
      setModelData({
        manufacturer_id: "",
        model_name: "",
        description: ""
      });
      
      // Call success callback to refresh parent table
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating model:', error);
      setErrors({ general: 'Erreur lors de la création du modèle. Veuillez réessayer.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
  

      <DynamicModal
        triggerLabel="Nouveau Modèle"
        open={open}
        onOpenChange={setOpen}
        title="Ajouter un nouveau modèle"
        description="Ajoutez un nouveau modèle à une marque existante."
        confirmLabel={isLoading ? "Création..." : "Créer le modèle"}
        onConfirm={handleSubmit}
      >
        <div className="space-y-6 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <div className="text-lg font-semibold text-blue-700">Création du modèle en cours...</div>
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
          
          {/* Brand/Manufacturer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="manufacturer">
              Marque <span className="text-red-500">*</span>
            </label>
            {loadingBrands ? (
              <div className="text-sm text-gray-500">Chargement des marques...</div>
            ) : (
              <Select
                value={modelData.manufacturer_id}
                onValueChange={(value) => setModelData({...modelData, manufacturer_id: value})}
                disabled={isLoading}
              >
                <SelectTrigger id="manufacturer" className={errors.manufacturer_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionner une marque" />
                </SelectTrigger>
                <SelectContent>
                  {availableBrands.map((brand, index) => (
                    <SelectItem key={index} value={brand.manufacturer_id.toString()}>
                      <div className="flex items-center gap-2">
                        <FaIndustry className="text-blue-600" />
                        {brand.manufacturer}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.manufacturer_id && (
              <p className="text-red-500 text-sm">{errors.manufacturer_id}</p>
            )}
          </div>
          
          {/* Model Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="model-name">
              Nom du modèle <span className="text-red-500">*</span>
            </label>
            <Input
              id="model-name"
              type="text"
              placeholder="Ex: iCT220, VX820, A35..."
              value={modelData.model_name}
              disabled={isLoading}
              onChange={(e) => setModelData({...modelData, model_name: e.target.value})}
              className={errors.model_name ? "border-red-500" : ""}
            />
            {errors.model_name && (
              <p className="text-red-500 text-sm">{errors.model_name}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Terminal de paiement Ingenico iCT220"
              value={modelData.description}
              disabled={isLoading}
              onChange={(e) => setModelData({...modelData, description: e.target.value})}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-700 text-sm">
              <strong>Note:</strong> Le modèle sera ajouté à la marque sélectionnée et apparaîtra dans la liste des TPEs disponibles.
            </p>
          </div>
        </div>
      </DynamicModal>
    </div>
  );
}
