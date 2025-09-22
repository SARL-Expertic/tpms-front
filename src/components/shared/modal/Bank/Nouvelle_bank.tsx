"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { DynamicModal } from "../Modal";
import { Plus, Trash2, ChevronDown, Building, CreditCard, UserPlus, MapPin, Phone, Key, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchtpetypes } from "@/app/api/tickets";

type SubAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
};

type TPEModel = { id: number; name: string };
type TPE = { id: number; manufacturer: string; model: TPEModel[] };

type Bank = {
  id: number;
  name: string;
  address: string;
  principalPhone: string;
  status: "ACTIVE" | "INACTIVE";
  tpes: TPE[];
  subaccounts: SubAccount[];
};



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

  const [existingTPEBrands, setExistingTPEBrands] = useState<TPE[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoadingBrands(true);
        const response = await fetchtpetypes();
        setExistingTPEBrands(response.data);
      } catch (err) {
        console.error("Error fetching TPE types:", err);
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);


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
      brandName = selectedBrand.manufacturer;
      const selectedModel = selectedBrand.model.find(m => m.id.toString() === tpeSelection.model);
      if (!selectedModel) return;
      
      modelName = selectedModel.name;
    }

    // Check if brand already exists in bank
    const existingBrandIndex = bank.tpes.findIndex(t => t.manufacturer === brandName);
    
    if (existingBrandIndex >= 0) {
      // Add model to existing brand
      const updatedTpes = [...bank.tpes];
      updatedTpes[existingBrandIndex] = {
        ...updatedTpes[existingBrandIndex],
        model: [...updatedTpes[existingBrandIndex].model, { id: Date.now(), name: modelName }]
      };
      setBank(prev => ({ ...prev, tpes: updatedTpes }));
    } else {
      // Add new brand with model
      setBank(prev => ({
        ...prev,
        tpes: [...prev.tpes, {
          id: brandId,
          manufacturer: brandName,
          model: [{ id: Date.now(), name: modelName }]
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
            ? {...tpe, model: tpe.model.filter(model => model.id !== modelId)}
            : tpe
        ).filter(tpe => tpe.model.length > 0) // Remove brands with no model
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
      triggerLabel={
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Building className="h-4 w-4" />
          Créer une Banque
        </Button>
      }
      title="Créer une nouvelle banque"
      description="Remplissez les informations pour ajouter une banque"
      cancelLabel="Annuler"
      confirmLabel="Créer"
      onConfirm={handleSubmit}
      size="xl"
    >
      <div className="space-y-6 p-1 max-h-[70vh] overflow-y-auto">
        <Tabs defaultValue="bank-info" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="bank-info">Informations Banque</TabsTrigger>
            <TabsTrigger value="subaccounts">Sous-comptes</TabsTrigger>
            <TabsTrigger value="tpes">Terminaux TPE</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank-info" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Informations de la Banque
                </CardTitle>
                <CardDescription>
                  Renseignez les informations principales de la banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name" className="flex items-center gap-1">
                    Nom de la Banque <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank-name"
                    value={bank.name}
                    onChange={(e) => setBank({ ...bank, name: e.target.value })}
                    placeholder="Ex: Banque Nationale d'Algérie"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-address" className="flex items-center gap-1">
                    Adresse <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="bank-address"
                      value={bank.address}
                      onChange={(e) => setBank({ ...bank, address: e.target.value })}
                      placeholder="Ex: 1 Boulevard Colonel Amirouche, Alger"
                      className={errors.address ? "border-red-500 pl-10" : "pl-10"}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-phone" className="flex items-center gap-1">
                    Téléphone principal <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="bank-phone"
                      value={bank.principalPhone}
                      onChange={(e) => setBank({ ...bank, principalPhone: e.target.value })}
                      placeholder="+213 ..."
                      className={errors.principalPhone ? "border-red-500 pl-10" : "pl-10"}
                    />
                  </div>
                  {errors.principalPhone && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.principalPhone}
                    </p>
                  )}
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
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          ACTIVE
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          INACTIVE
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subaccounts" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Sous-comptes
                  <Badge variant="outline" className="ml-2">
                    {bank.subaccounts.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ajoutez les sous-comptes associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sub-name" className="flex items-center gap-1">
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sub-name"
                      placeholder="Nom complet"
                      value={newSub.name}
                      onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-email" className="flex items-center gap-1">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sub-email"
                      placeholder="adresse@email.com"
                      value={newSub.email}
                      onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-phone" className="flex items-center gap-1">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sub-phone"
                      placeholder="+213 ..."
                      value={newSub.phone}
                      onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-password" className="flex items-center gap-1">
                      Mot de passe <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="sub-password"
                        type="password"
                        placeholder="Min. 6 caractères"
                        value={newSub.password}
                        onChange={(e) => setNewSub({ ...newSub, password: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {errors.subAccount && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-700 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.subAccount}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleAddSub} 
                  className="flex items-center gap-1 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter Sous-compte
                </Button>

                {bank.subaccounts.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {bank.subaccounts.map((sub) => (
                      <div key={sub.id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-sm text-gray-500">{sub.email} • {sub.phone}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubAccount(sub.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tpes" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  Terminaux de Paiement Électronique (TPE)
                  <Badge variant="outline" className="ml-2">
                    {bank.tpes.reduce((acc, tpe) => acc + tpe.model.length, 0)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ajoutez les marques et modèles de TPE associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-md">
                  <input
                    type="checkbox"
                    id="new-brand"
                    checked={tpeSelection.isNewBrand}
                    onChange={(e) => setTpeSelection({...tpeSelection, isNewBrand: e.target.checked, brand: "", model: ""})}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor="new-brand" className="text-sm cursor-pointer">
                    Ajouter une nouvelle marque
                  </Label>
                </div>
                
                {!tpeSelection.isNewBrand ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              {brand.manufacturer}
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
                            ?.model.map((model1) => (
                              <SelectItem key={model1.id} value={model1.id.toString()}>
                                {model1.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-tpe-brand" className="flex items-center gap-1">
                        Nouvelle marque <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-tpe-brand"
                        placeholder="Nom de la nouvelle marque"
                        value={tpeSelection.newBrandName}
                        onChange={(e) => setTpeSelection({...tpeSelection, newBrandName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-tpe-model" className="flex items-center gap-1">
                        Nouveau modèle <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-tpe-model"
                        placeholder="Nom du modèle"
                        value={tpeSelection.newModelName}
                        onChange={(e) => setTpeSelection({...tpeSelection, newModelName: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                
                {errors.tpe && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-700 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.tpe}
                    </p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleAddTPE} 
                  className="flex items-center gap-1 w-full"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter TPE
                </Button>

                {bank.tpes.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {bank.tpes.map((tpe) => (
                      <div key={tpe.id} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-lg">{tpe.manufacturer}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTPE(tpe.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer la marque
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tpe.model.map((model1) => (
                            <div key={model1.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <span className="text-sm">{model1.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTPE(tpe.id, model1.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicModal>
  );
}