"use client";

import { useState } from "react";
import { FaInfoCircle, FaBuilding, FaUsers, FaCreditCard, FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicModal } from "../Modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, User, Mail, Trash2, Plus, CreditCard, Building, Phone, MapPin } from "lucide-react";

type Subaccount = {
  id: number;
  name: string;
  email: string;
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

type Bank = {
  id: number;
  code: string;
  name: string;
  status?: string;
  phoneNumber?: string;
  currentLocation?: {
    id: number;
    name: string;
    address: string;
    wilaya: string;
    daira: string;
    localite: string;
  };
  subaccounts: Subaccount[];
  tpes: TpeBrand[];
};

type Props = {
  bank: Bank;
  onSave: (updatedBank: Bank) => void;
};

const statusColorMap: Record<string, string> = {
  ACTIVE: "bg-green-600",
  INACTIVE: "bg-red-500",
  PENDING: "bg-orange-500",
};

const statusOptions = ["ACTIVE", "INACTIVE", "PENDING"];

export function BankDetailsButton({ bank, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBank, setEditedBank] = useState<Bank>({ ...bank });
  const [activeTab, setActiveTab] = useState("info");

  const handleSave = () => {
    onSave(editedBank);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBank({ ...bank });
    setIsEditing(false);
  };

  const handleChange = (field: keyof Bank, value: any) => {
    setEditedBank(prev => ({ ...prev, [field]: value }));
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
  };

  const handleBrandChange = (index: number, field: keyof TpeBrand, value: string) => {
    setEditedBank(prev => {
      const updatedTpes = [...prev.tpes];
      updatedTpes[index] = {
        ...updatedTpes[index],
        [field]: value
      };
      return { ...prev, tpes: updatedTpes };
    });
  };

  const handleModelChange = (brandIndex: number, modelIndex: number, value: string) => {
    setEditedBank(prev => {
      const updatedTpes = [...prev.tpes];
      const updatedModels = [...updatedTpes[brandIndex].models];
      updatedModels[modelIndex] = {
        ...updatedModels[modelIndex],
        name: value
      };
      
      updatedTpes[brandIndex] = {
        ...updatedTpes[brandIndex],
        models: updatedModels
      };
      
      return { ...prev, tpes: updatedTpes };
    });
  };

  const addSubaccount = () => {
    setEditedBank(prev => ({
      ...prev,
      subaccounts: [
        ...prev.subaccounts,
        { id: Date.now(), name: "", email: "" }
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

  const addBrand = () => {
    setEditedBank(prev => ({
      ...prev,
      tpes: [
        ...prev.tpes,
        { id: Date.now(), name: "", models: [] }
      ]
    }));
  };

  const removeBrand = (index: number) => {
    setEditedBank(prev => {
      const updatedTpes = [...prev.tpes];
      updatedTpes.splice(index, 1);
      return { ...prev, tpes: updatedTpes };
    });
  };

  const addModel = (brandIndex: number) => {
    setEditedBank(prev => {
      const updatedTpes = [...prev.tpes];
      const updatedBrand = { ...updatedTpes[brandIndex] };
      updatedBrand.models = [
        ...updatedBrand.models,
        { id: Date.now(), name: "" }
      ];
      updatedTpes[brandIndex] = updatedBrand;
      return { ...prev, tpes: updatedTpes };
    });
  };

  const removeModel = (brandIndex: number, modelIndex: number) => {
    setEditedBank(prev => {
      const updatedTpes = [...prev.tpes];
      const updatedBrand = { ...updatedTpes[brandIndex] };
      updatedBrand.models = updatedBrand.models.filter((_, i) => i !== modelIndex);
      updatedTpes[brandIndex] = updatedBrand;
      return { ...prev, tpes: updatedTpes };
    });
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
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Banque: {bank.name}
          </span>
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
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave className="h-4 w-4" />
                Enregistrer
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
      }
      description={`Informations complètes pour la banque #${bank.id}`}
      cancelLabel="Fermer"
      size="xl"
    >
      <div className="space-y-6 p-1">
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
            <Input
              value={editedBank.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="text-xl w-full font-bold"
            />
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
            <Input
              value={editedBank.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="w-[200px]"
              placeholder="Numéro de téléphone"
            />
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
                              <Input
                                value={sub.name}
                                onChange={(e) => handleSubaccountChange(index, "name", e.target.value)}
                                className="mt-1"
                              />
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
                              <Input
                                value={sub.email}
                                onChange={(e) => handleSubaccountChange(index, "email", e.target.value)}
                                className="mt-1"
                              />
                            ) : (
                              <p className="text-base">{sub.email}</p>
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
{(bank.tpes ?? []).reduce((acc, tpe) => acc + (tpe.models?.length ?? 0), 0)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gestion des marques et modèles de TPE associés à cette banque
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  {isEditing && (
                    <Button onClick={addBrand} size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Ajouter une marque
                    </Button>
                  )}
                </div>
                
                {editedBank.tpes.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucune marque TPE</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {editedBank.tpes.map((brand, brandIndex) => (
                      <div key={brand.id} className="p-4 rounded-lg border bg-card relative">
                        {isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => removeBrand(brandIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <div className="mb-3">
                          <label className="text-sm font-medium text-muted-foreground">Marque</label>
                          {isEditing ? (
                            <Input
                              value={brand.name}
                              onChange={(e) => handleBrandChange(brandIndex, "name", e.target.value)}
                              className="font-semibold text-lg mt-1"
                            />
                          ) : (
                            <h4 className="font-semibold text-lg">{brand.name}</h4>
                          )}
                        </div>
                        
                        <div className="pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-muted-foreground">Modèles</label>
                            {isEditing && (
                              <Button 
                                onClick={() => addModel(brandIndex)} 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Ajouter un modèle
                              </Button>
                            )}
                          </div>
                          
                          {brand.models?.length > 0 ? (
                            <div className="grid gap-2">
                              {brand.models.map((model, modelIndex) => (
                                <div key={model.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                  {isEditing ? (
                                    <>
                                      <Input
                                        value={model.name}
                                        onChange={(e) => handleModelChange(brandIndex, modelIndex, e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => removeModel(brandIndex, modelIndex)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="flex-1">{model.name}</span>
                                      {isEditing && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-red-500 hover:text-red-700"
                                          onClick={() => removeModel(brandIndex, modelIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm py-2">Aucun modèle</p>
                          )}
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