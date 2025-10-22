"use client";

import { useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from "react";
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
  FaCheckCircle,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { UnsavedChangesDialog } from "@/components/shared/modal/UnsavedChangesDialog";
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
import { closeticket, UpdateNetworkCheckTicket, fetchConsumables, terminalperbankfetch, Updateconsoambleticket, Updateinterventionticket, Updatedeblockingticket, fetchClients, clientfetch, fetchAttachments, downloadAttachment } from "@/app/api/tickets";
import { wilayas } from "@/constants/algeria/wilayas";
import { Paperclip, Trash2, Upload, FileText, Download as DownloadIcon } from "lucide-react";

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
};

const statusOptions = [
  "DEMANDÉ",
  "ASSIGNÉ",
  "EN ATTENTE",
  "CLOTURÉ",
  "PROBLÈME CLIENT",
  "LIVRÉ",
  "ANNULÉ",
  "MASQUÉ"
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
    "MASQUÉ": "HIDDEN"
  };
  return reverseMap[frenchStatus] || frenchStatus;
};

export function TicketDetailsButton({ ticket, onSave, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket>({ ...ticket });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const clearOverlayTimeout = useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  }, []);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const showOverlayMessage = useCallback((message: string, duration = 1500) => {
    setSuccessMessage(message);
    setShowSuccessOverlay(true);
    clearOverlayTimeout();
    clearCloseTimeout();
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessOverlay(false);
      successTimeoutRef.current = null;
    }, duration);
  }, [clearCloseTimeout, clearOverlayTimeout]);

  // New state for dropdown data
  const [availableConsumables, setAvailableConsumables] = useState<any[]>([]);
  const [availableTPEs, setAvailableTPEs] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [originalTerminalTypeId, setOriginalTerminalTypeId] = useState<number | null>(null);
  const [originalTicketData, setOriginalTicketData] = useState<Ticket | null>(null);
  const [isLookingUpSN, setIsLookingUpSN] = useState(false);
  
  // Client selection states for DÉBLOCAGE
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [selectedExistingClient, setSelectedExistingClient] = useState<any>(null);
  const [useExistingClient, setUseExistingClient] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState<any>(null);
  
  // Attachment states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModalState = useCallback(() => {
    clearOverlayTimeout();
    clearCloseTimeout();
    setShowSuccessOverlay(false);
    setEditedTicket({ ...ticket });
    setOriginalTicketData({ ...ticket });
    setIsEditing(false);
    setSuccessMessage("");
    setSelectedBrand(null);
    setAvailableModels([]);
    setOriginalTerminalTypeId(null);
    setSelectedExistingClient(null);
    setUseExistingClient(false);
    setShowClientList(false);
    setSelectedWilaya(ticket.client?.location?.wilaya || null);
    setIsLoading(false);
    setIsLookingUpSN(false);
    setNewFiles([]);
  }, [clearCloseTimeout, clearOverlayTimeout, ticket]);

  const forceCloseModal = useCallback(() => {
    setIsModalOpen(false);
    resetModalState();
    setShowUnsavedDialog(false);
  }, [resetModalState]);

  const hasUnsavedChanges = useMemo(() => {
    if (!originalTicketData) return false;
    // Check if ticket data changed OR files were added
    const ticketChanged = JSON.stringify(editedTicket) !== JSON.stringify(originalTicketData);
    const filesAdded = newFiles.length > 0;
    return ticketChanged || filesAdded;
  }, [editedTicket, originalTicketData, newFiles]);

  const handleModalOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        resetModalState();
        setIsModalOpen(true);
        return;
      }

      if (isEditing && hasUnsavedChanges) {
        setShowUnsavedDialog(true);
        return;
      }

      forceCloseModal();
    },
    [forceCloseModal, hasUnsavedChanges, isEditing, resetModalState]
  );

  useEffect(() => {
    if (!isModalOpen) {
      setEditedTicket({ ...ticket });
      setOriginalTicketData({ ...ticket });
    }
  }, [ticket, isModalOpen]);

  useEffect(() => {
    return () => {
      clearOverlayTimeout();
      clearCloseTimeout();
    };
  }, [clearCloseTimeout, clearOverlayTimeout]);

  // Fetch consumables when editing starts
  const loadConsumables = async () => {
    try {
      const response = await fetchConsumables();
      setAvailableConsumables(response.data || []);
    } catch (error) {
      console.error("Error fetching consumables:", error);
    }
  };

  // Fetch existing clients for DÉBLOCAGE tickets
  const loadClients = async () => {
    if (!ticket.bank?.id) {
      console.warn("No bank ID available for client fetch");
      setAvailableClients([]);
      return;
    }
    
    try {
      const response = await clientfetch(ticket.bank.id);
      // Handle the response structure with clients array
      setAvailableClients(response.data?.clients || []);
    } catch (error) {
      console.error("Error fetching clients for bank:", ticket.bank.id, error);
      // Fallback if API doesn't exist yet or fails
      setAvailableClients([]);
    }
  };

  // Fetch attachments for the ticket
  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const response = await fetchAttachments(parseInt(ticket.id));
      setAttachments(response.data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Fetch TPE data when editing starts
  const loadTPEData = async () => {
    if (ticket.bank?.id) {
      try {
        const response = await terminalperbankfetch(ticket.bank.id);
        setAvailableTPEs(response.data || []);
        
        // Set initial brand and models if TPE data exists
        if (editedTicket.tpe?.brand) {
          const currentBrand = response.data.find((brand: any) => 
            brand.manufacturer === editedTicket.tpe.brand
          );
          if (currentBrand) {
            setSelectedBrand(currentBrand);
            setAvailableModels(currentBrand.models || []);
            
            // Find and store the original terminal_type_id
            const currentModel = currentBrand.models.find((model: any) => 
              model.model === editedTicket.tpe.model
            );
            if (currentModel) {
              setOriginalTerminalTypeId(currentModel.id);
            }
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

  // Handle SN lookup for DÉBLOCAGE tickets
  const handleSNLookup = async (serialNumber: string) => {
    if (type === "DÉBLOCAGE" && serialNumber && serialNumber !== ticket.tpe?.serialNumber) {
      setIsLookingUpSN(true);
      try {
        // This is a placeholder - you'll need to implement the actual API call
        // const response = await lookupTPEBySerialNumber(serialNumber);
        // if (response.data && response.data.client) {
        //   const clientData = response.data.client;
        //   setEditedTicket(prev => ({
        //     ...prev,
        //     client: {
        //       ...prev.client,
        //       name: clientData.name || "",
        //       brand: clientData.brand || "",
        //       phoneNumber: clientData.phoneNumber || "",
        //       mobileNumber: clientData.mobileNumber || "",
        //       location: {
        //         wilaya: clientData.location?.wilaya || "",
        //         daira: clientData.location?.daira || "",
        //         address: clientData.location?.address || ""
        //       }
        //     },
        //     tpe: {
        //       ...prev.tpe,
        //       brand: response.data.brand || "",
        //       model: response.data.model || ""
        //     }
        //   }));
        //   setSuccessMessage("ℹ️ Informations client trouvées et pré-remplies");
        // }
        console.log("Looking up SN:", serialNumber);
      } catch (error) {
        console.error("Error looking up SN:", error);
      } finally {
        setIsLookingUpSN(false);
      }
    }
  };

  // Handle existing client selection for DÉBLOCAGE
  const handleClientSelection = (client: any) => {
    setSelectedExistingClient(client);
    
    // Set selected wilaya for existing client
    if (client.location?.wilaya) {
      setSelectedWilaya(client.location.wilaya);
    }
    
    setEditedTicket(prev => ({
      ...prev,
      client: {
        ...prev.client,
        id: client.id,
        name: client.commercialName || client.name || "",
        brand: client.brand || "",
        phoneNumber: client.phoneNumber || "",
        mobileNumber: client.mobileNumber || "",
        location: {
          wilaya: client.location?.wilaya || "",
          daira: client.location?.daira || "",
          address: client.location?.address || ""
        }
      }
    }));
    setUseExistingClient(true);
    setShowClientList(false);
    showOverlayMessage("Client existant sélectionné", 1500);
  };

  // Toggle between existing and new client
  const toggleClientType = (useExisting: boolean) => {
    setUseExistingClient(useExisting);
    if (!useExisting) {
      // Reset to new client
      setSelectedExistingClient(null);
      setSelectedWilaya(null);
      setEditedTicket(prev => ({
        ...prev,
        client: {
          ...prev.client,
          id: "", // Use empty string instead of undefined
          name: "",
          brand: "",
          phoneNumber: "",
          mobileNumber: "",
          location: {
            wilaya: "",
            daira: "",
            address: ""
          }
        }
      }));
    }
  };

  // Load data when editing starts
  useEffect(() => {
    if (isEditing) {
      // Store original ticket data for comparison
      setOriginalTicketData({ ...ticket });
      loadConsumables();
      loadTPEData();
      
      // Load clients for DÉBLOCAGE tickets
      if (editedTicket.type === "DÉBLOCAGE") {
        loadClients();
      }
    }
  }, [isEditing, editedTicket.type]);

  // Load attachments when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadAttachments();
    }
  }, [isModalOpen]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewFiles(prev => [...prev, ...fileArray]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a newly added file
  const handleRemoveNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Download an attachment
  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const response = await downloadAttachment(parseInt(ticket.id), attachmentId);
      
      // Create blob from response
      const blob = new Blob([response.data]);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      showOverlayMessage('Erreur lors du téléchargement du fichier', 2000);
    }
  };

  // Function to handle the GET request
  const handleGetRequest = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    clearOverlayTimeout();
    clearCloseTimeout();
    try {
      // Example GET request with ticketId as query parameter
      const response: any = await closeticket(parseInt(id));

      showOverlayMessage("Ticket fermé avec succès !", 1600);
      if (onClose) {
        closeTimeoutRef.current = setTimeout(() => {
          onClose();
          closeTimeoutRef.current = null;
        }, 1200);
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      showOverlayMessage("Erreur lors de la fermeture du ticket", 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (options?: { closeAfter?: boolean }) => {
    if (!originalTicketData) return;

    setIsLoading(true);
    setSuccessMessage("");
    clearOverlayTimeout();
    clearCloseTimeout();
    
    // Function to get only changed fields
    const getChangedFields = () => {
      const changes: any = {};
      
      // Check status change
      if (editedTicket.status !== originalTicketData.status) {
        changes.status = frenchToEnglishStatus(editedTicket.status);
      }
      
      // Check notes change
      if (editedTicket.note !== originalTicketData.note) {
        changes.notes = editedTicket.note || "";
      }
      
      // Check client changes
      if (editedTicket.client.name !== originalTicketData.client?.name) {
        changes.client_commercialName = editedTicket.client.name;
      }
      if (editedTicket.client.phoneNumber !== originalTicketData.client?.phoneNumber) {
        changes.client_phoneNumber = editedTicket.client.phoneNumber;
      }
      if (editedTicket.client.brand !== originalTicketData.client?.brand) {
        changes.client_brand = editedTicket.client.brand;
      }
      if (editedTicket.client.location?.wilaya !== originalTicketData.client?.location?.wilaya) {
        changes.client_wilaya = editedTicket.client.location?.wilaya || "";
      }
      if (editedTicket.client.location?.daira !== originalTicketData.client?.location?.daira) {
        changes.client_daira = editedTicket.client.location?.daira || "";
      }
      if (editedTicket.client.location?.address !== originalTicketData.client?.location?.address) {
        changes.client_address = editedTicket.client.location?.address || "";
      }
      
      // Check TPE changes
      if (editedTicket.tpe?.serialNumber !== originalTicketData.tpe?.serialNumber) {
        changes.tpe_serialNumber = editedTicket.tpe?.serialNumber || "";
      }
      
      // Check terminal_type_id change
      const selectedModel = availableModels.find((model: any) => model.model === editedTicket.tpe?.model);
      const currentTerminalTypeId = selectedModel?.id || null;
      if (currentTerminalTypeId !== originalTerminalTypeId) {
        changes.terminal_type_id = currentTerminalTypeId;
      }
      
      // Check intervention problem change
      if (type === "INTERVENTION" && editedTicket.intervention?.problem !== originalTicketData.intervention?.problem) {
        changes.problem_description = editedTicket.intervention?.problem || "";
      }
      
      // Check consumables changes
      if (type === "CONSOMMABLE") {
        const originalItems = originalTicketData.consumableRequest?.items || [];
        const currentItems = editedTicket.consumableRequest?.items || [];
        
        if (JSON.stringify(originalItems) !== JSON.stringify(currentItems)) {
          changes.consumables = currentItems;
        }
        
        // Always include serial number for consumable tickets
        if (editedTicket.tpe?.serialNumber) {
          changes.serialNumber = editedTicket.tpe.serialNumber;
        }
      }
      
      // Always include serial number for déblocage tickets
      if (type === "DÉBLOCAGE" && editedTicket.tpe?.serialNumber) {
        changes.serialNumber = editedTicket.tpe.serialNumber;
      }
      
      return changes;
    };

    try {
      const changedFields = getChangedFields();
      
      // Check if there are changes OR files to upload
      const hasChanges = Object.keys(changedFields).length > 0;
      const hasFiles = newFiles.length > 0;
      
      // If no changes and no files, don't make API call
      if (!hasChanges && !hasFiles) {
        showOverlayMessage("Aucune modification détectée", 1500);
        setIsEditing(false);
        return;
      }

      // Always include required fields for API
      const baseData: any = {
        bank_id: editedTicket.bank ? editedTicket.bank.id : null,
        ...changedFields
      };

      // Add files if any were selected
      if (newFiles.length > 0) {
        baseData.files = newFiles;
      }

      // Handle client data based on ticket type and client selection
      if (type === "DÉBLOCAGE") {
        if (useExistingClient && selectedExistingClient) {
          // Existing client - send client_id and set new_client to false
          baseData.new_client = false;
          baseData.client_id = selectedExistingClient.id;
        } else {
          // New client - set new_client to true and don't send client_id
          baseData.new_client = true;
        }
      } else {
        // For other ticket types, use existing logic
        baseData.new_client = false;
        baseData.client_id = parseInt(editedTicket.client?.id?.toString() || "0");
      }

      // Log the data being sent (for debugging)
      console.log("📤 Sending update with:", {
        hasChanges,
        hasFiles,
        filesCount: newFiles.length,
        baseData: { ...baseData, files: baseData.files ? `${baseData.files.length} files` : 'none' }
      });

      // Handle different ticket types
      if (type === "CHOIX DE RÉSEAU") {
        await UpdateNetworkCheckTicket(parseInt(editedTicket.id), baseData);
        showOverlayMessage("Ticket mis à jour avec succès !");
      } else if (type === "CONSOMMABLE") {
        await Updateconsoambleticket(parseInt(editedTicket.id), baseData);
        showOverlayMessage("Ticket consommable mis à jour avec succès !");
      } else if (type === "INTERVENTION") {
        await Updateinterventionticket(parseInt(editedTicket.id), baseData);
        showOverlayMessage("Ticket intervention mis à jour avec succès !");
      } else if (type === "DÉBLOCAGE") {
        await Updatedeblockingticket(parseInt(editedTicket.id), baseData);
        showOverlayMessage("Ticket déblocage mis à jour avec succès !");
      } else {
        onSave(editedTicket);
        showOverlayMessage("Ticket mis à jour avec succès !");
      }
      
      // Clear new files after successful save
      setNewFiles([]);
      // Reload attachments to show newly uploaded ones
      await loadAttachments();
      
      setIsEditing(false);
      if (!options?.closeAfter) {
        setOriginalTicketData({ ...editedTicket });
      }
      
      // Call onClose to refresh the table
      if (onClose) {
        closeTimeoutRef.current = setTimeout(() => onClose(), 1200);
      }

      if (options?.closeAfter) {
        forceCloseModal();
      }
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      
      // Handle specific validation errors
      if (error.response?.status === 400 && error.response?.data?.errors?.consumables) {
        const consumableErrors = error.response.data.errors.consumables.errors;
        if (consumableErrors.includes("Duplicate consumables types are not allowed")) {
          showOverlayMessage("Erreur: types de consommables en double non autorisés. Veuillez supprimer les doublons.", 2200);
        } else {
          showOverlayMessage(`Erreur de validation: ${consumableErrors.join(", ")}`, 2200);
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
        
        showOverlayMessage(`Erreur: ${errorMessage}`, 2200);
      } else {
        showOverlayMessage("Erreur lors de la mise à jour du ticket", 2200);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsavedSaveAndClose = async () => {
    setShowUnsavedDialog(false);
    await handleSave({ closeAfter: true });
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    forceCloseModal();
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
  };

  const handleCancel = () => {
    setEditedTicket(originalTicketData ? { ...originalTicketData } : { ...ticket });
    setIsEditing(false);
    setSuccessMessage("");
    setShowSuccessOverlay(false);
    clearOverlayTimeout();
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

  const isPositiveMessage = successMessage
    ? !successMessage.toLowerCase().includes("erreur")
    : true;

  const overlayPalette: {
    card: string;
    iconBg: string;
    text: string;
    subtext: string;
    glow: string;
    accent: string;
    icon: ReactNode;
  } = isPositiveMessage
    ? {
        card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100",
        iconBg: "from-emerald-500 to-teal-500",
        text: "text-emerald-800",
        subtext: "text-emerald-700",
        glow: "bg-emerald-200/40",
        accent: "bg-teal-200/40",
        icon: <FaCheckCircle className="h-10 w-10" />,
      }
    : {
        card: "border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-rose-100",
        iconBg: "from-rose-500 to-red-500",
        text: "text-rose-800",
        subtext: "text-rose-700",
        glow: "bg-rose-200/40",
        accent: "bg-red-200/40",
        icon: <FaTimes className="h-10 w-10" />,
      };

  const overlaySubtext = isPositiveMessage
    ? "Vos modifications sont enregistrées. Vous pouvez poursuivre sereinement."
    : "Veuillez vérifier les informations puis réessayer.";

  return (
    <>
      <DynamicModal
      footer_childern={
        !isEditing && (
          <Button
            onClick={handleGetRequest}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-800 text-white cursor-pointer flex items-center gap-2"
          >
            <FaDownLeftAndUpRightToCenter className="text-sm" />
            {isLoading ? "Chargement..." : "Close Ticket"}
          </Button>
        )
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
      open={isModalOpen}
      onOpenChange={handleModalOpenChange}
      disableCancel={isLoading}
    >
      <div className="relative space-y-6 p-1">
        {showSuccessOverlay && successMessage && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/85 backdrop-blur-md">
            <div className={`relative max-w-md space-y-4 rounded-2xl border ${overlayPalette.card} p-8 text-center shadow-xl`}>
              <div className={`pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full ${overlayPalette.glow} blur-3xl`} />
              <div className={`pointer-events-none absolute bottom-0 -left-4 h-20 w-20 rounded-full ${overlayPalette.accent} blur-3xl`} />
              <div className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${overlayPalette.iconBg} text-white shadow-lg shadow-black/10`}>
                {overlayPalette.icon}
              </div>
              <div className="relative space-y-2">
                <p className={`text-xl font-semibold ${overlayPalette.text}`}>{successMessage}</p>
                <p className={`text-sm leading-relaxed ${overlayPalette.subtext}`}>
                  {overlaySubtext}
                </p>
              </div>
            </div>
          </div>
        )}
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
                onClick={() => handleSave()}
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
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <FaTimes />
                Annuler
              </Button>
            </div>
          )}
        </div>

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
          <>
            {/* Client Information for DÉBLOCAGE */}
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <FaUser className="text-green-600 dark:text-green-400" />
                </div>
                Client (Déblocage)
              </h3>
              
              {isEditing && (
                <div className="ml-12 mb-4">
                  <div className="flex gap-4 mb-3">
                    <Button
                      type="button"
                      variant={useExistingClient ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleClientType(true)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        checked={useExistingClient}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      Client existant
                    </Button>
                    <Button
                      type="button"
                      variant={!useExistingClient ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleClientType(false)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        checked={!useExistingClient}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      Nouveau client
                    </Button>
                  </div>
                  
                  {/* Existing Client Selection */}
                  {useExistingClient && (
                    <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="space-y-2">
                        <span className="font-medium text-sm">Sélectionner un client existant:</span>
                        <Select
                          value={selectedExistingClient?.id?.toString() || ""}
                          onValueChange={(clientId) => {
                            const client = availableClients.find(c => c.id.toString() === clientId);
                            if (client) {
                              handleClientSelection(client);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir un client existant" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {availableClients.length > 0 ? (
                              availableClients.map((client: any) => (
                                <SelectItem key={client.id} value={client.id.toString()}>
                                  <div className="flex flex-col">
                                    <div className="font-medium">
                                      {client.commercialName || client.name || 'Client sans nom'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {client.phoneNumber} • {client.brand || 'Enseigne non spécifiée'}
                                      {client.location && ` • ${client.location.wilaya || ''}`}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-clients" disabled>
                                Aucun client disponible
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid gap-2 text-sm ml-12">
                <div>
                  <span className="text-muted-foreground">Nom du client :</span>
                  {isEditing ? (
                    <Input
                      value={client?.name || ""}
                      onChange={(e) =>
                        handleNestedChange("client", "name", e.target.value)
                      }
                      className="mt-1"
                      placeholder={useExistingClient ? "Client sélectionné" : "Nom sera rempli automatiquement lors de la saisie du SN"}
                      disabled={useExistingClient && selectedExistingClient}
                    />
                  ) : (
                    ` ${client?.name || "N/A"}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Nom de l'enseigne:
                  </span>
                  {isEditing ? (
                    <Input
                      value={client?.brand || ""}
                      onChange={(e) =>
                        handleNestedChange("client", "brand", e.target.value)
                      }
                      className="mt-1"
                      disabled={useExistingClient && selectedExistingClient}
                    />
                  ) : (
                    ` ${client?.brand || "N/A"}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Téléphone:</span>
                  {isEditing ? (
                    <Input
                      value={client?.phoneNumber || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "client",
                          "phoneNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      disabled={useExistingClient && selectedExistingClient}
                    />
                  ) : (
                    ` ${client?.phoneNumber || "N/A"}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  {isEditing ? (
                    <Input
                      value={client?.mobileNumber || ""}
                      onChange={(e) =>
                        handleNestedChange(
                          "client",
                          "mobileNumber",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      disabled={useExistingClient && selectedExistingClient}
                    />
                  ) : (
                    ` ${client?.mobileNumber || "N/A"}`
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Adresse:</span>
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2 mt-1">
                      {/* Wilaya Dropdown */}
                      <Select
                        value={client?.location?.wilaya || ""}
                        onValueChange={(value) => {
                          setSelectedWilaya(value);
                          handleNestedChange("client", "location", {
                            ...client?.location,
                            wilaya: value,
                            daira: "" // Reset daira when wilaya changes
                          });
                        }}
                        disabled={useExistingClient && selectedExistingClient}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une wilaya" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Object.keys(wilayas).map((wilayaName, index) => (
                            <SelectItem key={index} value={wilayaName}>
                              {String(index + 1).padStart(2, '0')} - {wilayaName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Daira Dropdown */}
                      <Select
                        value={client?.location?.daira || ""}
                        onValueChange={(value) =>
                          handleNestedChange("client", "location", {
                            ...client?.location,
                            daira: value,
                          })
                        }
                        disabled={(useExistingClient && selectedExistingClient) || !selectedWilaya}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une daira" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {selectedWilaya && wilayas[selectedWilaya] ? 
                            wilayas[selectedWilaya].map((daira: string, index: number) => (
                              <SelectItem key={index} value={daira}>
                                {daira}
                              </SelectItem>
                            )) : []
                          }
                        </SelectContent>
                      </Select>
                      
                      {/* Address Input */}
                      <Input
                        placeholder="Adresse"
                        value={client?.location?.address || ""}
                        onChange={(e) =>
                          handleNestedChange("client", "location", {
                            ...client?.location,
                            address: e.target.value,
                          })
                        }
                        disabled={useExistingClient && selectedExistingClient}
                      />
                    </div>
                  ) : (
                    ` ${client?.location?.wilaya || "N/A"}, ${
                      client?.location?.daira || "N/A"
                    }, ${client?.location?.address || "N/A"}`
                  )}
                </div>
              </div>
            </div>

            {/* TPE Information for DÉBLOCAGE */}
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
                  <div>
                    <span className="text-muted-foreground">SN:</span>
                    {isEditing ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={tpe.serialNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleNestedChange("tpe", "serialNumber", value);
                            // Trigger SN lookup with debounce
                            setTimeout(() => handleSNLookup(value), 500);
                          }}
                          placeholder="Entrez le numéro de série"
                          disabled={isLookingUpSN}
                        />
                        {isLookingUpSN && (
                          <div className="flex items-center px-2">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      ` ${tpe.serialNumber}`
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
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

        {/* Attachments Section */}
        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
              <Paperclip className="text-indigo-600 dark:text-indigo-400 h-5 w-5" />
            </div>
            Pièces jointes
            {loadingAttachments && (
              <div className="ml-2 animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            )}
          </h3>
          
          <div className="ml-12 space-y-4">
            {/* Existing Attachments */}
            {attachments.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fichiers existants:</p>
                <div className="grid gap-2">
                  {attachments.map((attachment: any) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {attachment.filename || attachment.name || 'Fichier sans nom'}
                          </p>
                          {attachment.size && (
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment.id, attachment.filename || attachment.name || 'download')}
                        className="flex items-center gap-2 hover:bg-indigo-100"
                      >
                        <DownloadIcon className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !loadingAttachments && (
                <p className="text-sm text-muted-foreground">Aucune pièce jointe</p>
              )
            )}

            {/* Upload New Files (only in edit mode) */}
            {isEditing && (
              <div className="space-y-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Ajouter des fichiers:</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 hover:bg-indigo-50"
                >
                  <Upload className="h-4 w-4" />
                  Sélectionner des fichiers
                </Button>

                {/* Display newly selected files */}
                {newFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fichiers à envoyer ({newFiles.length}):</p>
                    <div className="grid gap-2">
                      {newFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveNewFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DynamicModal>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onCancel={handleContinueEditing}
        onDiscard={handleDiscardChanges}
        onConfirm={handleUnsavedSaveAndClose}
      />
    </>
  );
}
