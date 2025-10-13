"use client";

import { useState, useEffect } from "react";
import { FaInfoCircle, FaBuilding, FaUsers, FaCreditCard, FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicModal } from "../Modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, User, Mail, Trash2, Plus, CreditCard, Building, Phone, MapPin } from "lucide-react";
import { updatebank, terminaltypesfetch } from "@/app/api/tickets";

type Subaccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
};

type TpeModel = {
  id: number;
  name: string;
};

type TpeBrand = {
  id: number;
  name: string;
  models: TpeModel[];
};

type AvailableTPEBrand = {
  manufacturer: string;
  models: { id: number; model: string; description?: string; }[];
};

type Bank = {
  id: number;
  code: string;
  name: string;
  status?: string;
  phoneNumber?: string;
  numberofaccount?: number;
  terminaltpemarques?: string;
  currentLocation?: {
    id: number;
    name: string;
    address: string;
    wilaya: string | null;
    daira: string | null;
    localite: string | null;
    latitude?: number | null;
    longitude?: number | null;
    clientId?: number | null;
    createdAt?: string;
    updatedAt?: string;
  };
  subaccounts: Subaccount[];
   tpes: TpeBrand[];
  employees?: { 
    id: number; 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string;
  }[];
};

type Props = {
  bank: Bank;
  onSave: (updatedBank: Bank) => void;
};

const statusColorMap: Record<string, string> = {
  ACTIVE: "bg-green-600",
  UNACTIVE: "bg-red-500",
};

const statusOptions = ["ACTIVE", "UNACTIVE"];

export function BankDetailsButton({ bank, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedBank, setEditedBank] = useState<Bank>({ ...bank });
  const [originalBank, setOriginalBank] = useState<Bank>({ ...bank });
  const [activeTab, setActiveTab] = useState("info");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [numberOfModels, setNumberOfModels] = useState<number>(0);
  
  // TPE selection states
  const [availableTPEBrands, setAvailableTPEBrands] = useState<AvailableTPEBrand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [availableModels, setAvailableModels] = useState<{ id: number; model: string; description?: string; }[]>([]);
  
  // Separate state for newly added models (not yet saved)
  const [newlyAddedModels, setNewlyAddedModels] = useState<TpeBrand[]>([]);


 
  // Update original bank when editing mode is activated
  useEffect(() => {
    if (isEditing) {
      loadTPEBrands();
      setOriginalBank({ ...bank });
    }
  }, [isEditing, bank]);

  const loadTPEBrands = async () => {
    try {
      setLoadingBrands(true);
      const response = await terminaltypesfetch();
      setAvailableTPEBrands(response.data || []);
    } catch (err) {
      console.error("Error fetching TPE types:", err);
      setErrors(prev => ({...prev, tpe: "Erreur lors du chargement des marques TPE"}));
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      // Validate required fields
      const newErrors: Record<string, string> = {};
      if (!editedBank.name.trim()) {
        newErrors.name = "Le nom de la banque est requis";
      }
      if (!editedBank.code.trim()) {
        newErrors.code = "Le code de la banque est requis";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Prepare the payload with only changed fields
      const updateData: any = {};
      
      // Only include changed basic fields
      if (editedBank.name !== originalBank.name) updateData.bank_name = editedBank.name;
      if (editedBank.code !== originalBank.code) updateData.bank_code = editedBank.code;
      if ((editedBank.currentLocation?.address || "") !== (originalBank.currentLocation?.address || "")) {
        updateData.address = editedBank.currentLocation?.address || "";
      }
      if (editedBank.status !== originalBank.status) {
        updateData.status = (editedBank.status as "ACTIVE" | "UNACTIVE") || "ACTIVE";
      }
      
      // Handle TPE changes - combine existing edited models + newly added models
      const allCurrentModels = [...editedBank.tpes, ...newlyAddedModels];
      const currentTerminalTypeIds = allCurrentModels.map(tpe => tpe.id);
      const originalTerminalTypeIds = originalBank.tpes.map(tpe => tpe.id);
      
      // Find terminal types to remove and add
      const terminalTypeIdsToRemove = originalTerminalTypeIds.filter(id => !currentTerminalTypeIds.includes(id));
      const terminalTypesToAdd = currentTerminalTypeIds
        .filter(id => !originalTerminalTypeIds.includes(id))
        .map(id => ({ id }));
      
      console.log("🛠 TPE Changes Debug:");
      console.log("Existing models (editedBank.tpes):", editedBank.tpes);
      console.log("Newly added models:", newlyAddedModels);
      console.log("All current models combined:", allCurrentModels);
      console.log("Current Terminal Type IDs:", currentTerminalTypeIds);
      console.log("Original Terminal Type IDs:", originalTerminalTypeIds);
      console.log("🗑️ Terminal Type IDs to remove:", terminalTypeIdsToRemove);
      console.log("➕ Terminal Type IDs to add:", terminalTypesToAdd);
      
      // Send TPE operations if there are changes (including newly added models)
      if (terminalTypeIdsToRemove.length > 0) {
        updateData.terminalTypeIdsToRemove = terminalTypeIdsToRemove;
      }
      if (terminalTypesToAdd.length > 0) {
        updateData.terminalTypesToAdd = terminalTypesToAdd;
      }
      
      // Handle employee changes with separate tracking
      const currentEmployeeIds = editedBank.subaccounts
        .filter(sub => sub.id && sub.id > 0)
        .map(sub => sub.id);
      const originalEmployeeIds = originalBank.subaccounts.map(sub => sub.id);
      
      // Find employees to remove
      const employeeIdsToRemove = originalEmployeeIds.filter(id => !currentEmployeeIds.includes(id));
      
      // Process current employees (existing + new)
      const processedEmployees = editedBank.subaccounts.map(sub => {
        const employee: any = {
          firstName: sub.name.split(' ')[0] || sub.name,
          lastName: sub.name.split(' ').slice(1).join(' ') || "",
          email: sub.email,
          phone: sub.phone || ""
        };
        
        // Only include ID for employees that existed in the original bank
        if (sub.id && sub.id > 0) {
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
      const originalProcessedEmployees = originalBank.subaccounts.map(sub => ({
        id: sub.id,
        firstName: sub.name.split(' ')[0] || sub.name,
        lastName: sub.name.split(' ').slice(1).join(' ') || "",
        email: sub.email,
        phone: sub.phone
      }));
      
      const currentEmployeesForComparison = processedEmployees.map(emp => {
        const { plainPassword, ...empWithoutPassword } = emp;
        return empWithoutPassword;
      });
      
      // Send employee operations if there are changes
      if (employeeIdsToRemove.length > 0) {
        updateData.employeeIdsToRemove = employeeIdsToRemove;
      }
      if (JSON.stringify(currentEmployeesForComparison) !== JSON.stringify(originalProcessedEmployees)) {
        updateData.employees = processedEmployees;
      }
      
      // Check if there are any changes (basic fields, TPE changes, or employee changes)
      const hasChanges = Object.keys(updateData).length > 0 || newlyAddedModels.length > 0;
      
      // Only make API call if there are actual changes
      if (hasChanges) {
        // Log final payload before API call
        console.log("📦 Final update payload being sent to API:", updateData);
        
        // Call API to update bank
        await updatebank(editedBank.id, updateData);
        
        console.log("✅ Bank updated successfully");
        
        // Close modal and refresh the page
        window.location.reload();
      } else {
        // No changes, just close editing mode
        setIsEditing(false);
        setSelectedManufacturer("");
        setNewlyAddedModels([]); // Clear newly added models
        setSuccessMessage("ℹ️ Aucune modification à enregistrer");
        setTimeout(() => setSuccessMessage(""), 3000);
        console.log("ℹ️ No changes to save");
      }
    } catch (error: any) {
      console.error('Error updating bank:', error);
      
      // Clear any previous messages
      setSuccessMessage("");
      
      // Handle backend validation errors
      if (error?.response?.status === 400 && error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors: Record<string, string> = {};
        
        // Parse backend validation errors
        if (backendErrors.employees) {
          Object.entries(backendErrors.employees).forEach(([employeeIndex, employeeErrors]: [string, any]) => {
            if (employeeErrors.phone?.errors) {
              newErrors[`employee_${employeeIndex}_phone`] = employeeErrors.phone.errors[0];
            }
            if (employeeErrors.email?.errors) {
              newErrors[`employee_${employeeIndex}_email`] = employeeErrors.email.errors[0];
            }
            if (employeeErrors.firstName?.errors) {
              newErrors[`employee_${employeeIndex}_firstName`] = employeeErrors.firstName.errors[0];
            }
            if (employeeErrors.lastName?.errors) {
              newErrors[`employee_${employeeIndex}_lastName`] = employeeErrors.lastName.errors[0];
            }
          });
        }
        
        // Handle bank field validation errors
        if (backendErrors.bank_name?.errors) {
          newErrors.name = backendErrors.bank_name.errors[0];
        }
        if (backendErrors.bank_code?.errors) {
          newErrors.code = backendErrors.bank_code.errors[0];
        }
        if (backendErrors.address?.errors) {
          newErrors.address = backendErrors.address.errors[0];
        }
        if (backendErrors.status?.errors) {
          newErrors.status = backendErrors.status.errors[0];
        }
        
        // Set parsed validation errors
        setErrors(newErrors);
        setErrorMessage("❌ Veuillez corriger les erreurs de validation ci-dessous");
        
        // Auto-switch to the tab containing errors for better UX
        const hasEmployeeErrors = Object.keys(newErrors).some(key => key.startsWith('employee_'));
        const hasBankErrors = ['name', 'code', 'address', 'status'].some(field => newErrors[field]);
        
        if (hasEmployeeErrors) {
          setActiveTab("subaccounts");
        } else if (hasBankErrors) {
          setActiveTab("info");
        }
        
        // Clear error message after 10 seconds
        setTimeout(() => setErrorMessage(""), 10000);
        
      } else {
        // Handle general errors
        setErrors({});
        const errorMsg = error?.response?.data?.message || error?.message || 'Erreur inconnue';
        setErrorMessage(`❌ Erreur lors de la mise à jour: ${errorMsg}`);
        
        // Clear error message after 8 seconds
        setTimeout(() => setErrorMessage(""), 8000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedBank({ ...bank });
    setOriginalBank({ ...bank });
    setIsEditing(false);
    setSelectedManufacturer("");
    setSelectedModel("");
    setAvailableModels([]);
    setNewlyAddedModels([]); // Clear newly added models on cancel
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleChange = (field: keyof Bank, value: any) => {
    setEditedBank(prev => ({ ...prev, [field]: value }));
    
    // Clear any backend validation errors for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const { [field as string]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubaccountChange = (index: number, field: keyof Subaccount, value: string) => {
    setEditedBank(prev => {
      const updatedSubaccounts = [...prev.subaccounts];
      updatedSubaccounts[index] = {
        ...updatedSubaccounts[index],
        [field]: value
      };
      return { ...prev, subaccounts: updatedSubaccounts };
    });
    
    // Clear any backend validation errors for this field when user starts typing
    const errorKey = `employee_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  };



  const addSubaccount = () => {
    setEditedBank(prev => ({
      ...prev,
      subaccounts: [
        ...prev.subaccounts,
        { id: Date.now(), name: "", email: "", phone: "", password: "" }
      ]
    }));
  };

  const removeSubaccount = (index: number) => {
    setEditedBank(prev => {
      const updatedSubaccounts = [...prev.subaccounts];
      updatedSubaccounts.splice(index, 1);
      return { ...prev, subaccounts: updatedSubaccounts };
    });
  };

  // Handle manufacturer selection and populate models
  const handleManufacturerChange = (manufacturerName: string) => {
    setSelectedManufacturer(manufacturerName);
    setSelectedModel(""); // Reset model when manufacturer changes
    
    const selectedBrand = availableTPEBrands.find(b => b.manufacturer === manufacturerName);
    setAvailableModels(selectedBrand?.models || []);
    
    // Clear any previous errors
    setErrors(prev => {
      const { tpe, ...rest } = prev;
      return rest;
    });
  };

  // Handle adding a specific model (not entire manufacturer)
  const handleAddModel = () => {
    if (!selectedManufacturer) {
      setErrors(prev => ({...prev, tpe: "Veuillez sélectionner une marque"}));
      return;
    }

    if (!selectedModel) {
      setErrors(prev => ({...prev, tpe: "Veuillez sélectionner un modèle"}));
      return;
    }

    const selectedBrand = availableTPEBrands.find(b => b.manufacturer === selectedManufacturer);
    const selectedModelData = selectedBrand?.models.find(m => m.id.toString() === selectedModel);
    
    if (!selectedModelData) {
      setErrors(prev => ({...prev, tpe: "Modèle introuvable"}));
      return;
    }

    // Check if this specific model already exists in both existing and newly added models
    const allCurrentModels = [...editedBank.tpes, ...newlyAddedModels];
    const modelExists = allCurrentModels.some(tpe => tpe.id === selectedModelData.id);
    if (modelExists) {
      setErrors(prev => ({...prev, tpe: "Ce modèle existe déjà"}));
      return;
    }

    // Add only the selected model to newly added models state
    const newTPE: TpeBrand = {
      id: selectedModelData.id, // The terminal type ID to send to backend
      name: selectedManufacturer, // The manufacturer name
      models: [{ id: selectedModelData.id, name: selectedModelData.model }],
    };

    setNewlyAddedModels(prev => [...prev, newTPE]);

console.log("newly added models: ", [...newlyAddedModels, newTPE]);

    // Reset form
    setSelectedManufacturer("");
    setSelectedModel("");
    setAvailableModels([]);
    setErrors(prev => {
      const { tpe, ...rest } = prev;
      return rest;
    });
  };

  const removeModel = (terminalTypeId: number) => {
    // Check if it's in editedBank.tpes (existing models)
    const existsInEdited = editedBank.tpes.some(tpe => tpe.id === terminalTypeId);
    
    if (existsInEdited) {
      // Remove from editedBank.tpes
      setEditedBank(prev => ({
        ...prev,
        tpes: prev.tpes.filter(tpe => tpe.id !== terminalTypeId)
      }));
    } else {
      // Remove from newlyAddedModels
      setNewlyAddedModels(prev => prev.filter(tpe => tpe.id !== terminalTypeId));
    }
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
      title={`Banque: ${bank.name}`}
      description={`Informations complètes pour la banque #${bank.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-6 p-1">
        {/* Edit controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Gestion de la banque</span>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <FaEdit className="h-4 w-4" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave className="h-4 w-4" />
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <FaTimes className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          )}
        </div>
        {/* Show general error if any */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.general}
            </p>
          </div>
        )}
        
        {/* Show success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 animate-in fade-in-0 duration-300">
            <p className="text-green-700 text-sm font-medium flex items-center gap-2">
              <span className="text-lg">✅</span>
              {successMessage}
            </p>
          </div>
        )}
        
        {/* Show error message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 animate-in fade-in-0 duration-300">
            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </p>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="subaccounts">Sous-comptes</TabsTrigger>
            <TabsTrigger value="tpes">Terminaux TPE</TabsTrigger>
          </TabsList>
          
        <TabsContent value="info" className="space-y-4 mt-4">
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Building className="h-5 w-5 text-blue-600" />
        Informations de la Banque
      </CardTitle>
      <CardDescription>
        Détails de base de la banque
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Bank Name + Status */}
      <div className="flex justify-between gap-6 items-center">
        <div className="flex items-center w-full gap-6">
          {isEditing ? (
            <div className="w-full">
              <Input
                value={editedBank.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`text-xl w-full font-bold ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>
          ) : (
            <h2 className="text-xl font-bold text-foreground">{bank.name}</h2>
          )}
        </div>

        {bank.status && (
          isEditing ? (
            <Select
              value={editedBank.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger
                className={`w-[140px] ${statusColorMap[editedBank.status || ""]}`}
              >
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${statusColorMap[option]}`}
                      />
                      {option}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge
              className={`flex items-center ${
                statusColorMap[bank.status] || "bg-gray-500"
              } gap-2 px-3 py-2 text-sm`}
            >
              <div className="h-2 w-2 rounded-full bg-white" />
              {bank.status}
            </Badge>
          )
        )}
      </div>

      {/* ID + Code */}
      <div className="space-y-2">
        <p className="text-muted-foreground">ID: {bank.id}</p>
        <p className="text-muted-foreground">Code: {bank.code}</p>
      </div>

      {/* Phone Number */}
      {bank.phoneNumber && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {isEditing ? (
            <div className="flex-1">
              <Input
                value={editedBank.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className={`w-[200px] ${errors.phoneNumber ? 'border-red-500' : ''}`}
                placeholder="Numéro de téléphone"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{bank.phoneNumber}</p>
          )}
        </div>
      )}

      {/* Location */}
      {bank.currentLocation && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{bank.currentLocation.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {bank.currentLocation.address}
          </p>
          <p className="text-sm text-muted-foreground">
            {bank.currentLocation.localite}, {bank.currentLocation.daira},{" "}
            {bank.currentLocation.wilaya}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

          
          <TabsContent value="subaccounts" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Sous-comptes
                  <Badge variant="secondary" className="ml-2">
                    {bank?.subaccounts?.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gestion des sous-comptes associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  {isEditing && (
                    <Button onClick={addSubaccount} size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Ajouter un sous-compte
                    </Button>
                  )}
                </div>
                
                {editedBank?.subaccounts?.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucun sous-compte</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {editedBank?.subaccounts?.map((sub, index) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-lg border bg-card relative"
                      >
                        {isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => removeSubaccount(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Nom
                            </label>
                            {isEditing ? (
                              <div>
                                <Input
                                  value={sub.name}
                                  onChange={(e) => handleSubaccountChange(index, "name", e.target.value)}
                                  className={`mt-1 ${errors[`employee_${index}_firstName`] || errors[`employee_${index}_lastName`] ? 'border-red-500' : ''}`}
                                  placeholder="Nom complet"
                                />
                                {(errors[`employee_${index}_firstName`] || errors[`employee_${index}_lastName`]) && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors[`employee_${index}_firstName`] || errors[`employee_${index}_lastName`]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-base font-medium">{sub.name}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              Email
                            </label>
                            {isEditing ? (
                              <div>
                                <Input
                                  value={sub.email}
                                  onChange={(e) => handleSubaccountChange(index, "email", e.target.value)}
                                  className={`mt-1 ${errors[`employee_${index}_email`] ? 'border-red-500' : ''}`}
                                  placeholder="email@example.com"
                                  type="email"
                                />
                                {errors[`employee_${index}_email`] && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors[`employee_${index}_email`]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-base">{sub.email}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              Téléphone
                            </label>
                            {isEditing ? (
                              <div>
                                <Input
                                  value={sub.phone}
                                  onChange={(e) => handleSubaccountChange(index, "phone", e.target.value)}
                                  className={`mt-1 ${errors[`employee_${index}_phone`] ? 'border-red-500' : ''}`}
                                  placeholder="+213XXXXXXXXX (format international)"
                                />
                                {errors[`employee_${index}_phone`] && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors[`employee_${index}_phone`]}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Format attendu: +213XXXXXXXXX (ex: +213642008426)
                                </p>
                              </div>
                            ) : (
                              <p className="text-base">{sub.phone}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Mot de passe
                            </label>
                            {isEditing ? (
                              <Input
                                value={sub.password || ""}
                                onChange={(e) => handleSubaccountChange(index, "password", e.target.value)}
                                className="mt-1"
                                placeholder="Nouveau mot de passe"
                                type="password"
                              />
                            ) : (
                              <p className="text-base text-muted-foreground">••••••••</p>
                            )}
                          </div>
                        </div>
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
                  Terminaux TPE
                  <Badge variant="secondary" className="ml-2">
                    {(() => {
                      const allCurrentModels = [...editedBank.tpes, ...newlyAddedModels];
                      const uniqueManufacturers = new Set(allCurrentModels?.map(tpe => tpe.name) || []);
                      const totalModels = allCurrentModels?.length || 0;
                      return `${uniqueManufacturers.size} marque${uniqueManufacturers.size > 1 ? 's' : ''} • ${totalModels} modèle${totalModels > 1 ? 's' : ''}`;
                    })()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gestion des marques et modèles de TPE associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingBrands && editedBank.tpes.length === 0 && newlyAddedModels.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Chargement des données TPE...</div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-3 text-blue-900">Ajouter un modèle TPE</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Marque</label>
                        {loadingBrands ? (
                          <div className="text-sm text-gray-500">Chargement des marques...</div>
                        ) : (
                          <Select
                            value={selectedManufacturer}
                            onValueChange={handleManufacturerChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une marque" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTPEBrands.map((brand, index) => (
                                <SelectItem key={index} value={brand.manufacturer}>
                                  {brand.manufacturer} ({brand.models.length} modèles)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Modèle</label>
                        <Select
                          value={selectedModel}
                          onValueChange={setSelectedModel}
                          disabled={!selectedManufacturer || availableModels.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un modèle" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels
                              .filter(model => {
                                const allCurrentModels = [...editedBank.tpes, ...newlyAddedModels];
                                return !allCurrentModels.some(tpe => tpe.id === model.id);
                              })
                              .map((model) => (
                              <SelectItem key={model.id} value={model.id.toString()}>
                                {model.model} {model.description && `(${model.description})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Seul ce modèle sera ajouté à la banque</p>
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
                        onClick={handleAddModel} 
                        size="sm" 
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedManufacturer || !selectedModel}
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter ce modèle
                      </Button>
                    </div>
                  </div>
                )}
                
                {editedBank.tpes.length === 0 && newlyAddedModels.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucune marque TPE</p>
                  </div>
                ) : (() => {
                  // Combine existing and newly added models for display
                  const allCurrentModels = [...editedBank.tpes, ...newlyAddedModels];
                  
                  // Group TPEs by manufacturer name
                  const groupedTPEs = allCurrentModels.reduce((groups: Record<string, typeof allCurrentModels>, tpe) => {
                    const manufacturerName = tpe.name;
                    if (!groups[manufacturerName]) {
                      groups[manufacturerName] = [];
                    }
                    groups[manufacturerName].push(tpe);
                    return groups;
                  }, {});

                  return (
                    <div className="grid gap-4">
                      {Object.entries(groupedTPEs).map(([manufacturerName, tpes]) => (
                        <div key={manufacturerName} className="p-4 rounded-lg border bg-card">
                          <div className="mb-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-muted-foreground">Marque</label>
                              <Badge variant="outline" className="text-xs">
                                {tpes.length} modèle{tpes.length > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-lg">{manufacturerName}</h4>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Modèles associés
                            </label>
                            <div className="grid gap-2">
                              {tpes.map((tpe) => {
                                // Check if this is a newly added model for different styling
                                const isNewlyAdded = newlyAddedModels.some(newTpe => newTpe.id === tpe.id);
                                
                                return (
                                <div  key={tpe.id} className={`flex items-center justify-between p-3 rounded-lg border ${isNewlyAdded ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      {isNewlyAdded && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                          Nouveau
                                        </span>
                                      )}
                                      
                                      <span className="font-medium">{tpe.models[0]?.name || 'N/A'}</span>
                                    </div>
                                  </div>
                                  
                                  {isEditing && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => removeModel(tpe.id)}
                                      title="Supprimer ce modèle"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DynamicModal>
  );
}



