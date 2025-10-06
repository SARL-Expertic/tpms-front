"use client";

import { useState, useEffect } from "react";
import {
  FaInfoCircle,
  FaUser,
  FaCreditCard,
  FaCalendarAlt,
  FaStickyNote,
  FaEdit,
  FaSave,
  FaTimes,
  FaCentos,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { Ticket } from "@/types/ticket";
import {
  FaBoxesStacked,
  FaClosedCaptioning,
  FaDeleteLeft,
  FaDownLeftAndUpRightToCenter,
  FaDownload,
} from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { closeticket, UpdateNetworkCheckTicket, fetchConsumables, terminalperbankfetch, Updateconsoambleticket } from "@/app/api/tickets";

type Props = {
  ticket: Ticket;
  onSave: (updatedTicket: Ticket) => void;
  onClose?: () => void; // Add optional onClose prop
};

const statusColorMap: Record<string, string> = {
  DEMANDÉ: "bg-gray-500",
  ASSIGNÉ: "bg-purple-500",
  "EN ATTENTE": "bg-blue-500",
  CLOTURÉ: "bg-green-600",
  "PROBLÈME CLIENT": "bg-red-500",
  LIVRÉ: "bg-green-500",
  ANNULÉ: "bg-red-600",
  "EN ATTENTE D'APPROBATION (MASQUÉ)": "bg-yellow-500",
  MASQUÉ: "bg-gray-400",
  "EN COURS": "bg-orange-500",
};

const statusOptions = [
  "DEMANDÉ",
  "ASSIGNÉ",
  "EN ATTENTE",
  "CLOTURÉ",
  "PROBLÈME CLIENT",
  "LIVRÉ",
  "ANNULÉ",
  "EN ATTENTE D'APPROBATION (MASQUÉ)",
  "MASQUÉ",
  "EN COURS"
];

// Function to convert French status to English for API
const frenchToEnglishStatus = (frenchStatus: string): string => {
  const reverseMap: Record<string, string> = {
    "DEMANDÉ": "REQUESTED",
    "ASSIGNÉ": "ASSIGNED",
    "EN ATTENTE": "PENDING",
    "CLOTURÉ": "COMPLETED",
    "PROBLÈME CLIENT": "CLIENT_PROBLEM",
    "LIVRÉ": "DELIVERED",
    "ANNULÉ": "CANCELLED",
    "EN ATTENTE D'APPROBATION (MASQUÉ)": "HIDDEN_PENDING_APPROVAL",
    "MASQUÉ": "HIDDEN",
    "EN COURS": "IN_PROGRESS"
  };
  return reverseMap[frenchStatus] || frenchStatus;
};

export function TicketDetailsButton({ ticket, onSave, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket>({ ...ticket });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // New state for dropdown data
  const [availableConsumables, setAvailableConsumables] = useState<any[]>([]);
  const [availableTPEs, setAvailableTPEs] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  // Fetch consumables when editing starts
  const loadConsumables = async () => {
    try {
      const response = await fetchConsumables();
      setAvailableConsumables(response.data || []);
    } catch (error) {
      console.error("Error fetching consumables:", error);
    }
  };

  // Fetch TPE data when editing starts
  const loadTPEData = async () => {
    if (ticket.bank?.id) {
      try {
        const response = await terminalperbankfetch(ticket.bank.id);
        setAvailableTPEs(response.data || []);
        
        // Set initial brand and models if TPE data exists
        if (editedTicket.tpe.brand) {
          const currentBrand = response.data.find((brand: any) => 
            brand.manufacturer === editedTicket.tpe.brand
          );
          if (currentBrand) {
            setSelectedBrand(currentBrand);
            setAvailableModels(currentBrand.models || []);
          }
        }
      } catch (error) {
        console.error("Error fetching TPE data:", error);
      }
    }
  };

  // Handle brand selection change
  const handleBrandChange = (brandName: string) => {
    const brand = availableTPEs.find((b: any) => b.manufacturer === brandName);
    setSelectedBrand(brand);
    setAvailableModels(brand?.models || []);
    
    // Update TPE brand in ticket
    handleNestedChange("tpe", "brand", brandName);
    // Reset model when brand changes
    handleNestedChange("tpe", "model", "");
  };

  // Load data when editing starts
  useEffect(() => {
    if (isEditing) {
      loadConsumables();
      loadTPEData();
    }
  }, [isEditing]);

  // Function to handle the GET request
  const handleGetRequest = async () => {
    setIsLoading(true);
    setSuccessMessage(""); // Clear any previous message
    try {
      // Example GET request with ticketId as query parameter
      const response: any = await closeticket(parseInt(id));

      setSuccessMessage("Ticket fermé avec succès!");
      // Call onClose to refresh the table
      if (onClose) {
        setTimeout(() => onClose(), 1000); // Delay to show success message
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      setSuccessMessage("Erreur lors de la fermeture du ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Handle different ticket types
      if (type === "CHOIX DE RÉSEAU") {
        // For network check tickets, call the update API
        const updateData = {
          client_id: parseInt(client.id.toString()), // Always send client_id as number
          bank_id: editedTicket.bank ? editedTicket.bank.id : null, // Send bank_id from edited ticket
          client_commercialName: editedTicket.client.name,
          client_phoneNumber: editedTicket.client.phoneNumber,
          client_brand: editedTicket.client.brand,
          client_wilaya: editedTicket.client.location?.wilaya || "",
          client_daira: editedTicket.client.location?.daira || "",
          client_address: editedTicket.client.location?.address || "",
          notes: editedTicket.note || "",
          status: frenchToEnglishStatus(editedTicket.status) // Convert French status to English
        };

        await UpdateNetworkCheckTicket(parseInt(editedTicket.id), updateData);
        setSuccessMessage("✅ Ticket mis à jour avec succès !");
        
        // Call onClose to refresh the table
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        }
      } else if (type === "CONSOMMABLE") {
        // For consumable tickets, call the update API
        // Find the selected terminal type ID
        const selectedModel = availableModels.find((model: any) => model.model === editedTicket.tpe.model);
        const terminal_type_id = selectedModel?.id || null;

        const updateData = {
          terminal_type_id,
          new_client: false, // Since we're updating existing ticket, it's not a new client
          client_id: parseInt(editedTicket.client.id.toString()),
          bank_id: editedTicket.bank ? editedTicket.bank.id : null,
          client_commercialName: editedTicket.client.name,
          client_phoneNumber: editedTicket.client.phoneNumber,
          client_brand: editedTicket.client.brand,
          client_wilaya: editedTicket.client.location?.wilaya || "",
          client_daira: editedTicket.client.location?.daira || "",
          client_address: editedTicket.client.location?.address || "",
          notes: editedTicket.note || "",
          status: frenchToEnglishStatus(editedTicket.status), // Convert French status to English
          consumables: editedTicket.consumableRequest?.items || []
        };

        await Updateconsoambleticket(parseInt(editedTicket.id), updateData);
        setSuccessMessage("✅ Ticket consommable mis à jour avec succès !");
        
        // Call onClose to refresh the table
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        }
      } else {
        // For other ticket types, use the existing onSave prop
        onSave(editedTicket);
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      
      // Handle specific validation errors
      if (error.response?.status === 400 && error.response?.data?.errors?.consumables) {
        const consumableErrors = error.response.data.errors.consumables.errors;
        if (consumableErrors.includes("Duplicate consumables types are not allowed")) {
          setSuccessMessage("❌ Erreur: Types de consommables en double non autorisés. Veuillez supprimer les doublons.");
        } else {
          setSuccessMessage(`❌ Erreur de validation: ${consumableErrors.join(", ")}`);
        }
      } else if (error.response?.data?.message) {
        let errorMessage = error.response.data.message;
        
        // Handle stock shortage errors
        if (errorMessage.includes("Not enough stock for")) {
          // Extract product name and quantities from the error message
          const match = errorMessage.match(/Not enough stock for "([^"]+)" \(have (\d+), need (\d+)\)/);
          if (match) {
            const [, productName, have, need] = match;
            errorMessage = `Stock insuffisant pour "${productName}" (disponible: ${have}, requis: ${need})`;
          } else {
            // Fallback for generic stock error
            errorMessage = errorMessage.replace("Not enough stock", "Stock insuffisant");
          }
        }
        
        setSuccessMessage(`❌ Erreur: ${errorMessage}`);
      } else {
        setSuccessMessage("❌ Erreur lors de la mise à jour du ticket");
      }
    }
  };

  const handleCancel = () => {
    setEditedTicket({ ...ticket });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setEditedTicket((prev) => {
      if (parent === "client") {
        return {
          ...prev,
          client: {
            ...prev.client,
            [field]: value,
          },
        };
      } else if (parent === "tpe") {
        return {
          ...prev,
          tpe: {
            ...prev.tpe,
            [field]: value,
          },
        };
      } else if (parent === "bank" && prev.bank) {
        return {
          ...prev,
          bank: {
            ...prev.bank,
            [field]: value,
          },
        };
      } else if (parent === "intervention" && prev.intervention) {
        return {
          ...prev,
          intervention: {
            ...prev.intervention,
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  const handleArrayChange = (
    parent: string,
    index: number,
    field: string,
    value: any
  ) => {
    setEditedTicket((prev) => {
      if (parent === "consumableRequest.items" && prev.consumableRequest) {
        const updatedItems = [...prev.consumableRequest.items];
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
        };
        return {
          ...prev,
          consumableRequest: {
            ...prev.consumableRequest,
            items: updatedItems,
          },
        };
      } else if (parent === "deblockingOrder.items" && prev.deblockingOrder) {
        const updatedItems = [...prev.deblockingOrder.items];
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
        };
        return {
          ...prev,
          deblockingOrder: {
            ...prev.deblockingOrder,
            items: updatedItems,
          },
        };
      }
      return prev;
    });
  };

  // Add new consumable item
  const handleAddConsumableItem = () => {
    setEditedTicket((prev) => {
      // Use the first available consumable as default, or fallback
      const defaultType = availableConsumables.length > 0 
        ? availableConsumables[0].type || availableConsumables[0].name || "Nouvel article"
        : "Nouvel article";
      
      const newItem = { type: defaultType, quantity: 1 };
      return {
        ...prev,
        consumableRequest: {
          items: [...(prev.consumableRequest?.items || []), newItem],
        },
      };
    });
  };

  // Remove consumable item
  const handleRemoveConsumableItem = (index: number) => {
    setEditedTicket((prev) => {
      if (!prev.consumableRequest) return prev;
      const updatedItems = prev.consumableRequest.items.filter((_, i) => i !== index);
      return {
        ...prev,
        consumableRequest: {
          items: updatedItems,
        },
      };
    });
  };

  const {
    id,
    type,
    status,
    note,
    tpe,
    client,
    deblockingOrder,
    requestDate,
    completedDate,
    intervention,
    consumableRequest,
  } = editedTicket;

  return (
    <DynamicModal
      footer_childern={
        <Button
          onClick={handleGetRequest}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-800 text-white cursor-pointer flex items-center gap-2"
        >
          <FaDownLeftAndUpRightToCenter className="text-sm" />
          {isLoading ? "Chargement..." : "Close Ticket"}
        </Button>
      }
      triggerLabel={
        <Button
          size="sm"
          className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2"
        >
          <FaInfoCircle className="text-lg" />
          Détails
        </Button>
      }
      title={`Détails du ticket #${id}`}
      description={`Informations complètes du ticket #${id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-6 p-1">
        {/* Edit Controls */}
        <div className="flex justify-end">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaEdit />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave />
                Enregistrer
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
            </div>
          )}
        </div>

        {/* Success/Error Message */}
        {successMessage && (
          <div
            className={`p-4 rounded-lg text-center font-medium ${
              successMessage.includes("succès") ||
              successMessage.includes("Ticket fermé")
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {successMessage}
          </div>
        )}

        {/* Ticket Header */}
        <div className="dark:from-slate-800 dark:to-gray-900 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="p-2 rounded-lg">#{id}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  N° ticket
                </span>
              </h2>
            </div>

            {isEditing ? (
              <Select
                value={status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger
                  className={`w-[180px] ${statusColorMap[status]}`}
                >
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions
                    .filter((option) => {
                      // Hide "CLOTURÉ" option unless the current status is already "CLOTURÉ"
                      if (option === "CLOTURÉ" && status !== "CLOTURÉ") {
                        return false;
                      }
                      return true;
                    })
                    .map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge
                className={`flex items-center font-semibold ${statusColorMap[status]} gap-2 px-3 py-2 text-sm`}
              >
                <span className={`h-2 w-2 rounded-full bg-white`} />
                {status}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Type (read-only, cannot edit) */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-md">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FaCreditCard className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">Type</h3>
                <p
                  className="text-sm font-medium mt-1 px-3 py-1 rounded-md 
                 bg-gray-100 dark:bg-gray-700 w-fit shadow-sm"
                >
                  {type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-md">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <FaCalendarAlt className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">Dates</h3>
                <div className="text-sm">
                  <div>
                    <span className="text-muted-foreground">Demande:</span>
                    {` ${requestDate}`}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clôture:</span>
                    {` ${completedDate || "—"}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Information - Read-only display */}
        {ticket.bank && (
          <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                <FaCentos className="text-indigo-600 dark:text-indigo-400" />
              </div>
              Banque
            </h3>
            <div className="grid gap-2 text-sm ml-12">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">ID Banque:</span>
                <span className="font-medium text-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  #{ticket.bank.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Nom de la banque:</span>
                <span className="font-medium text-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {ticket.bank.name}
                </span>
              </div>
            </div>
          </div>
        )}

        <div
          className={`grid ${
            type === "INTERVENTION" || type === "CONSOMMABLE"
              ? "md:grid-cols-2"
              : "md:grid-cols-1"
          } gap-6`}
        >
          {/* Client Information */}
          {type !== "DÉBLOCAGE" && (
            <div
              className={`space-y-3 ${
                type === "INTERVENTION" || type === "CONSOMMABLE"
                  ? "col-span-1"
                  : "col-span-2"
              } bg-white dark:bg-gray-800 p-4 rounded-lg border`}
            >
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <FaUser className="text-green-600 dark:text-green-400" />
                </div>
                Client
              </h3>
              <div className="grid gap-2 text-sm ml-12">
                <div>
                  <span className="text-muted-foreground">Nom du client :</span>
                  {isEditing ? (
                    <Input
                      value={client.name}
                      onChange={(e) =>
                        handleNestedChange("client", "name", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${client.name}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Nom de l'enseigne:
                  </span>
                  {isEditing ? (
                    <Input
                      value={client.brand}
                      onChange={(e) =>
                        handleNestedChange("client", "brand", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${client.brand}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone:</span>
                  {isEditing ? (
                    <Input
                      value={client.phoneNumber}
                      onChange={(e) =>
                        handleNestedChange(
                          "client",
                          "phoneNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${client.phoneNumber}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  {isEditing ? (
                    <Input
                      value={client.mobileNumber}
                      onChange={(e) =>
                        handleNestedChange(
                          "client",
                          "mobileNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${client.mobileNumber}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Adresse:</span>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      <Input
                        placeholder="Wilaya"
                        value={client.location?.wilaya || ""}
                        onChange={(e) =>
                          handleNestedChange("client", "location", {
                            ...client.location,
                            wilaya: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Daira"
                        value={client.location?.daira || ""}
                        onChange={(e) =>
                          handleNestedChange("client", "location", {
                            ...client.location,
                            daira: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Adresse"
                        value={client.location?.address || ""}
                        onChange={(e) =>
                          handleNestedChange("client", "location", {
                            ...client.location,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    ` ${client.location?.wilaya || "N/A"}, ${
                      client.location?.daira || "N/A"
                    }, ${client.location?.address || "N/A"}`
                  )}
                </div>
              </div>
            </div>
          )}

          {type === "CONSOMMABLE" && (
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <FaBoxesStacked className="text-green-600 dark:text-green-400" />
                  </div>
                  Consommables
                </h3>
                {isEditing && (
                  <Button
                    onClick={handleAddConsumableItem}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    + Ajouter
                  </Button>
                )}
              </div>
              {!consumableRequest || consumableRequest.items.length === 0 ? (
                <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">
                  Aucun consommable demandé
                </p>
              ) : (
                <div className="ml-12">
                  <div className="grid gap-4 text-sm">
                    {consumableRequest.items.map((item, index) => (
                      <div key={index} className="mb-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className="text-muted-foreground font-medium">
                                Type:
                              </span>
                              {isEditing ? (
                                <Select
                                  value={item.type}
                                  onValueChange={(value) =>
                                    handleArrayChange(
                                      "consumableRequest.items",
                                      index,
                                      "type",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sélectionner un type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableConsumables.map((consumable: any) => (
                                      <SelectItem 
                                        key={consumable.id} 
                                        value={consumable.type || consumable.name}
                                      >
                                        {consumable.type || consumable.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="ml-2 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-blue-800 dark:text-blue-300">
                                  {item.type}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-muted-foreground font-medium">
                                Quantité:
                              </span>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleArrayChange(
                                      "consumableRequest.items",
                                      index,
                                      "quantity",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="mt-1 w-20 inline-block ml-2"
                                  min="0"
                                />
                              ) : (
                                <span className="ml-2 font-medium">{item.quantity}</span>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              onClick={() => handleRemoveConsumableItem(index)}
                              variant="destructive"
                              size="sm"
                              className="ml-2"
                            >
                              <FaTimes />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TPE Information - Show for intervention and consumable tickets only */}
          {(type === "INTERVENTION" || type === "CONSOMMABLE") && (
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <FaCreditCard className="text-orange-600 dark:text-orange-400" />
                </div>
                TPE
              </h3>
              {(type === "INTERVENTION" || type === "CONSOMMABLE") && (
                <>
                  <div className="grid gap-2 text-sm ml-12">
                    <div>
                      <span className="text-muted-foreground">SN:</span>
                      {isEditing ? (
                        <Input
                          value={tpe.serialNumber}
                          onChange={(e) =>
                            handleNestedChange(
                              "tpe",
                              "serialNumber",
                              e.target.value
                            )
                          }
                          className="mt-1"
                        />
                      ) : (
                        ` ${tpe.serialNumber}`
                      )}
                    </div>

                       <div>
                      <span className="text-muted-foreground">Marque:</span>
                      {isEditing ? (
                        <Select
                          value={tpe.brand}
                          onValueChange={handleBrandChange}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner une marque" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTPEs.map((brand: any) => (
                              <SelectItem key={brand.manufacturer_id} value={brand.manufacturer}>
                                {brand.manufacturer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        ` ${tpe.brand}`
                      )}
                    </div>


                    <div>
                      <span className="text-muted-foreground">Modèle:</span>
                      {isEditing ? (
                        <Select
                          value={tpe.model}
                          onValueChange={(value) =>
                            handleNestedChange("tpe", "model", value)
                          }
                          disabled={!selectedBrand || availableModels.length === 0}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner un modèle" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map((model: any) => (
                              <SelectItem key={model.id} value={model.model}>
                                {model.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        ` ${tpe.model}`
                      )}
                    </div>
                 
                  </div>
                  {type === "INTERVENTION" && intervention?.problem && (
                    <div className="grid gap-2 text-sm ml-12 mt-2">
                      <div>
                        <span className="text-muted-foreground">Problème:</span>
                        {isEditing ? (
                          <Textarea
                            value={intervention.problem}
                            onChange={(e) =>
                              handleNestedChange(
                                "intervention",
                                "problem",
                                e.target.value
                              )
                            }
                            className="mt-1"
                          />
                        ) : (
                          ` ${intervention.problem}`
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* DÉBLOCAGE Information - Separate section */}
        {type === "DÉBLOCAGE" && (
          <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <FaCreditCard className="text-red-600 dark:text-red-400" />
              </div>
              TPE - Déblocage
            </h3>
            {tpe && (
              <div className="grid gap-2 text-sm ml-12">
                <div>
                  <span className="text-muted-foreground">SN:</span>
                  {isEditing ? (
                    <Input
                      value={tpe.serialNumber}
                      onChange={(e) =>
                        handleNestedChange(
                          "tpe",
                          "serialNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${tpe.serialNumber}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Modèle:</span>
                  {isEditing ? (
                    <Input
                      value={tpe.model}
                      onChange={(e) =>
                        handleNestedChange("tpe", "model", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${tpe.model}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Marque:</span>
                  {isEditing ? (
                    <Input
                      value={tpe.brand}
                      onChange={(e) =>
                        handleNestedChange("tpe", "brand", e.target.value)
                      }
                      className="mt-1"
                    />
                  ) : (
                    ` ${tpe.brand}`
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <FaStickyNote className="text-amber-600 dark:text-amber-400" />
            </div>
            Notes
          </h3>
          {isEditing ? (
            <Textarea
              value={note || ""}
              onChange={(e) => handleChange("note", e.target.value)}
              className="mt-1 ml-12"
              placeholder="Ajoutez une note..."
            />
          ) : (
            <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">
              {note || "Aucune note"}
            </p>
          )}
        </div>
      </div>
    </DynamicModal>
  );
}
