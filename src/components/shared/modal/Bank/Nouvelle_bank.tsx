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
import { createbank, fetchtpetypes, terminaltypesfetch } from "@/app/api/tickets";

type SubAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
};

type TPEModel = { 
  id: number; 
  model: string; 
  description?: string; 
};

type TPEBrand = {
  manufacturer: string;
  models: TPEModel[];
};

type BankTPE = {
  manufacturer: string;
  models: TPEModel[];
};

type Bank = {
  id: number;
  name: string;
  bank_code: string;
  address: string;
  principalPhone: string;
  status: "ACTIVE" | "UNACTIVE";
  tpes: BankTPE[];
  subaccounts: SubAccount[];
  addTerminalTypes: boolean
};



export function CreateBankModal({ onCreate }: { onCreate: (bank: Bank) => void }) {
  const [bank, setBank] = useState<Bank>({
    id: 0,
    name: "",
    bank_code: "",
    address: "",
    principalPhone: "",
    status: "ACTIVE",
    tpes: [],
    subaccounts: [],
    addTerminalTypes: false
  });

  // Track original bank state for comparison
  const [originalBank, setOriginalBank] = useState<Bank | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [existingTPEBrands, setExistingTPEBrands] = useState<TPEBrand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoadingBrands(true);
        const response = await terminaltypesfetch();
        setExistingTPEBrands(response.data || []);
      } catch (err) {
        console.error("Error fetching TPE types:", err);
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, []);


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSub, setNewSub] = useState<SubAccount>({
    id: Date.now(),
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [tpeSelection, setTpeSelection] = useState({
    brand: "",
    model: ""
  });

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!bank.name) newErrors.name = "Le nom de la banque est requis";
  if (!bank.bank_code) newErrors.bank_code = "Le code de la banque est requis";
  if (!bank.address) newErrors.address = "L'adresse est requise";
  if (!bank.principalPhone) newErrors.principalPhone = "Le numéro de téléphone est requis";
  if (!/^\+?[\d\s-]{10,}$/.test(bank.principalPhone)) newErrors.principalPhone = "Numéro de téléphone invalide";
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const validateSubAccount = () => {
  if (!newSub.name) return "Le nom est requis";
  if (!newSub.email) return "L'email est requis";
  if (!/\S+@\S+\.\S+/.test(newSub.email)) return "Format de l'email invalide";
  if (!newSub.phone) return "Le numéro de téléphone est requis";
  // Password is optional - only validate if provided
  if (newSub.password && newSub.password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
  return "";
};

const validateTPE = () => {
  if (!tpeSelection.brand) return "Veuillez sélectionner une marque";
  if (!tpeSelection.model) return "Veuillez sélectionner un modèle";
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

    const selectedBrand = existingTPEBrands.find(b => b.manufacturer === tpeSelection.brand);
    if (!selectedBrand) return;
    
    const selectedModel = selectedBrand.models.find(m => m.id?.toString() === tpeSelection.model);
    if (!selectedModel) return;

    const brandName = selectedBrand.manufacturer;
    const modelData = {
      id: selectedModel.id,
      model: selectedModel.model,
      description: selectedModel.description
    };

    // Check if brand already exists in bank
    const existingBrandIndex = bank.tpes.findIndex(t => t.manufacturer === brandName);
    
    if (existingBrandIndex >= 0) {
      // Add model to existing brand
      const updatedTpes = [...bank.tpes];
      updatedTpes[existingBrandIndex] = {
        ...updatedTpes[existingBrandIndex],
        models: [
          ...updatedTpes[existingBrandIndex].models,
          modelData
        ]
      };
      setBank(prev => ({ ...prev, tpes: updatedTpes }));
    } else {
      // Add new brand with model
      setBank(prev => ({
        ...prev,
        tpes: [
          ...prev.tpes,
          {
            manufacturer: brandName,
            models: [modelData]
          }
        ]
      }));
    }

    // Reset TPE form
    setTpeSelection({
      brand: "",
      model: ""
    });
    setErrors({...errors, tpe: ""});
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return false;

    setIsSubmitting(true);

    try {
    const payload: any = {};
    
    // Always include basic required fields for creation
    if (!isEdit) {
      payload.bank_name = bank.name;
      payload.bank_code = bank.bank_code;
      payload.address = bank.address;
      payload.phone_number = bank.principalPhone;
      payload.status = bank.status;
    } else {
      // For updates, only include changed fields
      if (originalBank) {
        if (bank.name !== originalBank.name) payload.bank_name = bank.name;
        if (bank.bank_code !== originalBank.bank_code) payload.bank_code = bank.bank_code;
        if (bank.address !== originalBank.address) payload.address = bank.address;
        if (bank.principalPhone !== originalBank.principalPhone) payload.phone_number = bank.principalPhone;
        if (bank.status !== originalBank.status) payload.status = bank.status;
      }
    }

    // Handle TPE changes with separate tracking
    const currentTPEIds = bank.tpes.flatMap(tpe => tpe.models.map(model => model.id));
    const originalTPEIds = originalBank ? originalBank.tpes.flatMap(tpe => tpe.models.map(model => model.id)) : [];
    
    // For new banks, send all TPE IDs as additions
    if (!isEdit) {
      if (currentTPEIds.length > 0) {
        payload.existingTerminalTypeIds = currentTPEIds;
      }
    } else {
      // For edits, track specific additions and removals
      const terminalTypeIdsToRemove = originalTPEIds.filter(id => !currentTPEIds.includes(id));
      const terminalTypesToAdd = currentTPEIds
        .filter(id => !originalTPEIds.includes(id))
        .map(id => ({ id }));
      
      // Only send TPE operations if there are changes
      if (terminalTypeIdsToRemove.length > 0) {
        payload.terminalTypeIdsToRemove = terminalTypeIdsToRemove;
      }
      if (terminalTypesToAdd.length > 0) {
        payload.terminalTypesToAdd = terminalTypesToAdd;
      }
    }

    // Handle employee changes with separate tracking
    if (!isEdit) {
      // For new banks, send all employees as new
      if (bank.subaccounts.length > 0) {
        const processedEmployees = bank.subaccounts.map(sub => ({
          firstName: sub.name.split(' ')[0] || sub.name,
          lastName: sub.name.split(' ').slice(1).join(' ') || sub.name,
          email: sub.email,
          phone: sub.phone,
          ...(sub.password && sub.password.trim() !== '' && { plainPassword: sub.password })
        }));
        payload.employees = processedEmployees;
      }
    } else {
      // For edits, track specific operations
      const currentEmployeeIds = bank.subaccounts
        .filter(sub => sub.id && sub.id > 0)
        .map(sub => sub.id);
      const originalEmployeeIds = originalBank ? originalBank.subaccounts.map(sub => sub.id) : [];
      
      // Find employees to remove
      const employeeIdsToRemove = originalEmployeeIds.filter(id => !currentEmployeeIds.includes(id));
      
      // Process current employees (existing + new)
      const processedEmployees = bank.subaccounts.map(sub => {
        const employee: any = {
          firstName: sub.name.split(' ')[0] || sub.name,
          lastName: sub.name.split(' ').slice(1).join(' ') || sub.name,
          email: sub.email,
          phone: sub.phone
        };
        
        // Only include ID for employees that existed in the original bank
        if (sub.id && sub.id > 0 && originalBank) {
          const existedInOriginal = originalBank.subaccounts.some(orig => orig.id === sub.id);
          if (existedInOriginal) {
            employee.id = sub.id;
          }
        }
        
        // Only include password if it's not empty (user actually typed something)
        if (sub.password && sub.password.trim() !== '') {
          employee.plainPassword = sub.password;
        }
        
        return employee;
      });
      
      // Check if there are employee changes (updates or additions)
      const originalProcessedEmployees = originalBank ? originalBank.subaccounts.map(sub => ({
        id: sub.id,
        firstName: sub.name.split(' ')[0] || sub.name,
        lastName: sub.name.split(' ').slice(1).join(' ') || sub.name,
        email: sub.email,
        phone: sub.phone
      })) : [];
      
      const currentEmployeesForComparison = processedEmployees.map(emp => {
        const { plainPassword, ...empWithoutPassword } = emp;
        return empWithoutPassword;
      });
      
      // Send employee operations if there are changes
      if (employeeIdsToRemove.length > 0) {
        payload.employeeIdsToRemove = employeeIdsToRemove;
      }
      if (JSON.stringify(currentEmployeesForComparison) !== JSON.stringify(originalProcessedEmployees)) {
        payload.employees = processedEmployees;
      }
    }

    // Only make API call if there are actual changes or it's a new bank
    if (!isEdit || Object.keys(payload).length > 0) {
      await createbank(payload);
      onCreate(bank);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating bank:', error);
    setErrors({ general: 'Erreur lors de la création de la banque. Veuillez réessayer.' });
    return false;
  } finally {
    setIsSubmitting(false);
  }
};

  const removeSubAccount = (id: number) => {
    setBank(prev => ({
      ...prev,
      subaccounts: prev.subaccounts.filter(sub => sub.id !== id)
    }));
  };

  const removeTPE = (brandName: string, modelId?: number) => {
    if (modelId) {
      // Remove specific model
      setBank(prev => ({
        ...prev,
        tpes: prev.tpes.map(tpe => 
          tpe.manufacturer === brandName 
            ? {...tpe, models: tpe.models.filter(model => model.id !== modelId)}
            : tpe
        ).filter(tpe => tpe.models.length > 0) // Remove brands with no models
      }));
    } else {
      // Remove entire brand
      setBank(prev => ({
        ...prev,
        tpes: prev.tpes.filter(tpe => tpe.manufacturer !== brandName)
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
      confirmLabel={isSubmitting ? "Création en cours..." : "Créer"}
      onConfirm={handleSubmit}
    >
      <div className="space-y-6 p-1 max-h-[70vh] overflow-y-auto relative">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="text-lg font-semibold text-blue-700">Création de la banque en cours...</div>
              <div className="text-sm text-gray-600">Veuillez patienter, ne fermez pas cette fenêtre</div>
            </div>
          </div>
        )}
        
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.general}
            </p>
          </div>
        )}
        
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
                    autoComplete="off"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

<div className="space-y-2">
                  <Label htmlFor="bank-code" className="flex items-center gap-1">
                    Code de la Banque <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bank-code"
                    value={bank.bank_code}
                    onChange={(e) => setBank({ ...bank, bank_code: e.target.value })}
                    placeholder="Ex: BNA123"
                    className={errors.bank_code ? "border-red-500" : ""}
                    autoComplete="off"
                  />
                  {errors.bank_code && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.bank_code}
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
                      autoComplete="off"
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
                      autoComplete="off"
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
                    onValueChange={(val: "ACTIVE" | "UNACTIVE") => setBank({ ...bank, status: val })}
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
                      <SelectItem value="UNACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          UNACTIVE
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
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-email" className="flex items-center gap-1">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sub-email"
                      type="email"
                      placeholder="adresse@email.com"
                      value={newSub.email}
                      onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-phone" className="flex items-center gap-1">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sub-phone"
                      placeholder="+213 ..."
                      type="tel"
                      value={newSub.phone}
                      onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
                      autoComplete="off"
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
                        placeholder="Nouveau mot de passe (optionnel)"
                        value={newSub.password}
                        onChange={(e) => setNewSub({ ...newSub, password: e.target.value })}
                        className="pl-10"
                        autoComplete="off"
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
                    {bank.tpes.reduce((acc, tpe) => acc + tpe.models.length, 0)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Ajoutez les marques et modèles de TPE associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {existingTPEBrands.map((brand, index) => (
                          <SelectItem key={index} value={brand.manufacturer}>
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
                          .find(b => b.manufacturer === tpeSelection.brand)
                          ?.models.map((model) => (
                            <SelectItem key={model.id} value={model.id.toString()}>
                              {model.model}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
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
                    {bank.tpes.map((tpe, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-lg">{tpe.manufacturer}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTPE(tpe.manufacturer)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer la marque
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {tpe.models.map((model) => (
                            <div key={model.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <span className="text-sm">{model.model}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTPE(tpe.manufacturer, model.id)}
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