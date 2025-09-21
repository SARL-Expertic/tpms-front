"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { DynamicModal } from "../Modal";
import { Plus, Trash2, ChevronDown, Building, CreditCard, UserPlus } from "lucide-react";

type SubAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
};

type TPEModel = { id: number; name: string };
type TPE = { id: number; name: string; models: TPEModel[] };

type Bank = {
  id: number;
  name: string;
  address: string;
  principalPhone: string;
  status: "ACTIVE" | "INACTIVE";
  tpes: TPE[];
  subaccounts: SubAccount[];
};

// Mock data for existing TPE brands and models
const existingTPEBrands: TPE[] = [
  {
    id: 1,
    name: "Ingenico",
    models: [
      { id: 1, name: "iCT250" },
      { id: 2, name: "iWL250" },
      { id: 3, name: "Move5000" },
    ],
  },
  {
    id: 2,
    name: "Verifone",
    models: [
      { id: 4, name: "VX520" },
      { id: 5, name: "VX680" },
      { id: 6, name: "VX820" },
    ],
  },
  {
    id: 3,
    name: "Pax",
    models: [
      { id: 7, name: "A920" },
      { id: 8, name: "S80" },
      { id: 9, name: "S300" },
    ],
  },
];

export function CreateBankModal({ onCreate }: { onCreate: (bank: Bank) => void }) {
  const [bank, setBank] = useState<Bank>({
    id: Date.now(),
    name: "",
    address: "",
    principalPhone: "",
    status: "ACTIVE",
    tpes: [],
    subaccounts: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSub, setNewSub] = useState<SubAccount>({
    id: Date.now(),
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [tpeSelection, setTpeSelection] = useState({
    brand: "",
    model: "",
    isNewBrand: false,
    newBrandName: "",
    newModelName: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bank.name) newErrors.name = "Bank name is required";
    if (!bank.address) newErrors.address = "Address is required";
    if (!bank.principalPhone) newErrors.principalPhone = "Phone number is required";
    if (!/^\+?[\d\s-]{10,}$/.test(bank.principalPhone)) newErrors.principalPhone = "Invalid phone number";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSubAccount = () => {
    if (!newSub.name) return "Name is required";
    if (!newSub.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(newSub.email)) return "Invalid email format";
    if (!newSub.phone) return "Phone is required";
    if (!newSub.password) return "Password is required";
    if (newSub.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateTPE = () => {
    if (tpeSelection.isNewBrand) {
      if (!tpeSelection.newBrandName) return "Brand name is required";
      if (!tpeSelection.newModelName) return "Model name is required";
    } else {
      if (!tpeSelection.brand) return "Please select a brand";
      if (!tpeSelection.model) return "Please select a model";
    }
    return "";
  };

  const handleAddSub = () => {
    const error = validateSubAccount();
    if (error) {
      setErrors({...errors, subAccount: error});
      return;
    }
    
    setBank((prev) => ({ ...prev, subaccounts: [...prev.subaccounts, { ...newSub }] }));
    setNewSub({ id: Date.now(), name: "", email: "", phone: "", password: "" });
    setErrors({...errors, subAccount: ""});
  };

  const handleAddTPE = () => {
    const error = validateTPE();
    if (error) {
      setErrors({...errors, tpe: error});
      return;
    }

    let brandId: number;
    let brandName: string;
    let modelName: string;

    if (tpeSelection.isNewBrand) {
      brandId = Date.now();
      brandName = tpeSelection.newBrandName;
      modelName = tpeSelection.newModelName;
    } else {
      const selectedBrand = existingTPEBrands.find(b => b.id.toString() === tpeSelection.brand);
      if (!selectedBrand) return;
      
      brandId = selectedBrand.id;
      brandName = selectedBrand.name;
      const selectedModel = selectedBrand.models.find(m => m.id.toString() === tpeSelection.model);
      if (!selectedModel) return;
      
      modelName = selectedModel.name;
    }

    // Check if brand already exists in bank
    const existingBrandIndex = bank.tpes.findIndex(t => t.name === brandName);
    
    if (existingBrandIndex >= 0) {
      // Add model to existing brand
      const updatedTpes = [...bank.tpes];
      updatedTpes[existingBrandIndex] = {
        ...updatedTpes[existingBrandIndex],
        models: [...updatedTpes[existingBrandIndex].models, { id: Date.now(), name: modelName }]
      };
      setBank(prev => ({ ...prev, tpes: updatedTpes }));
    } else {
      // Add new brand with model
      setBank(prev => ({
        ...prev,
        tpes: [...prev.tpes, {
          id: brandId,
          name: brandName,
          models: [{ id: Date.now(), name: modelName }]
        }]
      }));
    }

    // Reset TPE form
    setTpeSelection({
      brand: "",
      model: "",
      isNewBrand: false,
      newBrandName: "",
      newModelName: "",
    });
    setErrors({...errors, tpe: ""});
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onCreate(bank);
  };

  const removeSubAccount = (id: number) => {
    setBank(prev => ({
      ...prev,
      subaccounts: prev.subaccounts.filter(sub => sub.id !== id)
    }));
  };

  const removeTPE = (brandId: number, modelId?: number) => {
    if (modelId) {
      // Remove specific model
      setBank(prev => ({
        ...prev,
        tpes: prev.tpes.map(tpe => 
          tpe.id === brandId 
            ? {...tpe, models: tpe.models.filter(model => model.id !== modelId)}
            : tpe
        ).filter(tpe => tpe.models.length > 0) // Remove brands with no models
      }));
    } else {
      // Remove entire brand
      setBank(prev => ({
        ...prev,
        tpes: prev.tpes.filter(tpe => tpe.id !== brandId)
      }));
    }
  };

  return (
    <DynamicModal
      triggerLabel="Créer une Banque"
      title="Créer une nouvelle banque"
      description="Remplissez les informations pour ajouter une banque"
      cancelLabel="Annuler"
      confirmLabel="Créer"
      onConfirm={handleSubmit}
      size="lg"
    >
      <div className="space-y-6 p-2 max-h-[70vh] overflow-y-auto">
        {/* Bank Info */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations de la Banque
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="bank-name">Nom de la Banque *</Label>
            <Input
              id="bank-name"
              value={bank.name}
              onChange={(e) => setBank({ ...bank, name: e.target.value })}
              placeholder="Ex: Banque Nationale d'Algérie"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-address">Adresse *</Label>
            <Input
              id="bank-address"
              value={bank.address}
              onChange={(e) => setBank({ ...bank, address: e.target.value })}
              placeholder="Ex: 1 Boulevard Colonel Amirouche, Alger"
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-phone">Téléphone principal *</Label>
            <Input
              id="bank-phone"
              value={bank.principalPhone}
              onChange={(e) => setBank({ ...bank, principalPhone: e.target.value })}
              placeholder="+213 ..."
              className={errors.principalPhone ? "border-red-500" : ""}
            />
            {errors.principalPhone && <p className="text-red-500 text-sm">{errors.principalPhone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-status">Status</Label>
            <Select
              value={bank.status}
              onValueChange={(val: "ACTIVE" | "INACTIVE") => setBank({ ...bank, status: val })}
            >
              <SelectTrigger id="bank-status">
                <SelectValue placeholder="Choisir le status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subaccounts */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Sous-comptes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sub-name">Nom *</Label>
              <Input
                id="sub-name"
                placeholder="Nom complet"
                value={newSub.name}
                onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-email">Email *</Label>
              <Input
                id="sub-email"
                placeholder="adresse@email.com"
                value={newSub.email}
                onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-phone">Téléphone *</Label>
              <Input
                id="sub-phone"
                placeholder="+213 ..."
                value={newSub.phone}
                onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-password">Mot de passe *</Label>
              <Input
                id="sub-password"
                type="password"
                placeholder="Min. 6 caractères"
                value={newSub.password}
                onChange={(e) => setNewSub({ ...newSub, password: e.target.value })}
              />
            </div>
          </div>
          
          {errors.subAccount && <p className="text-red-500 text-sm">{errors.subAccount}</p>}
          
          <Button variant="outline" size="sm" onClick={handleAddSub} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Ajouter Sous-compte
          </Button>

          {bank.subaccounts.length > 0 && (
            <div className="border rounded-lg divide-y">
              {bank.subaccounts.map((sub) => (
                <div key={sub.id} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-gray-500">{sub.email} • {sub.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSubAccount(sub.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TPEs */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Terminaux de Paiement Électronique (TPE)
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="new-brand"
              checked={tpeSelection.isNewBrand}
              onChange={(e) => setTpeSelection({...tpeSelection, isNewBrand: e.target.checked, brand: "", model: ""})}
              className="h-4 w-4"
            />
            <Label htmlFor="new-brand" className="text-sm">Nouvelle marque</Label>
          </div>
          
          {!tpeSelection.isNewBrand ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tpe-brand">Marque existante</Label>
                <Select
                  value={tpeSelection.brand}
                  onValueChange={(value) => setTpeSelection({...tpeSelection, brand: value, model: ""})}
                >
                  <SelectTrigger id="tpe-brand">
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingTPEBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tpe-model">Modèle</Label>
                <Select
                  value={tpeSelection.model}
                  onValueChange={(value) => setTpeSelection({...tpeSelection, model: value})}
                  disabled={!tpeSelection.brand}
                >
                  <SelectTrigger id="tpe-model">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingTPEBrands
                      .find(b => b.id.toString() === tpeSelection.brand)
                      ?.models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-tpe-brand">Nouvelle marque *</Label>
                <Input
                  id="new-tpe-brand"
                  placeholder="Nom de la nouvelle marque"
                  value={tpeSelection.newBrandName}
                  onChange={(e) => setTpeSelection({...tpeSelection, newBrandName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-tpe-model">Nouveau modèle *</Label>
                <Input
                  id="new-tpe-model"
                  placeholder="Nom du modèle"
                  value={tpeSelection.newModelName}
                  onChange={(e) => setTpeSelection({...tpeSelection, newModelName: e.target.value})}
                />
              </div>
            </div>
          )}
          
          {errors.tpe && <p className="text-red-500 text-sm">{errors.tpe}</p>}
          
          <Button variant="outline" size="sm" onClick={handleAddTPE} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Ajouter TPE
          </Button>

          {bank.tpes.length > 0 && (
            <div className="border rounded-lg divide-y">
              {bank.tpes.map((tpe) => (
                <div key={tpe.id} className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{tpe.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTPE(tpe.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="pl-4 space-y-2">
                    {tpe.models.map((model) => (
                      <div key={model.id} className="flex justify-between items-center">
                        <span className="text-sm">{model.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTPE(tpe.id, model.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DynamicModal>
  );
}