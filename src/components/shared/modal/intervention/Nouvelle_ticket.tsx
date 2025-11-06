'use client'

import { useState, useEffect, useRef } from "react"
import { DynamicModal } from '../Modal'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FaExchangeAlt, FaTrash, FaNetworkWired, FaUnlock, FaTools, FaBoxOpen, FaCheckCircle } from 'react-icons/fa'
import { MdOutlineUploadFile } from 'react-icons/md'
import { wilayas } from "@/constants/algeria/wilayas"
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import { Button } from "@/components/ui/button"
import { FaExclamationTriangle, FaCreditCard, FaClipboardList } from 'react-icons/fa';
import { FaBox, FaClipboardCheck,  FaMinus  } from 'react-icons/fa';
import { clientfetch, createConsumableTicket, createDeblockingTicket, createInterventionTicket, createNetworkCheckTicket, fetchClients, fetchTPE, fetchConsumablesItems , fetchConsumablesBankEmployee } from "@/app/api/tickets"
import { CheckboxItem } from "@radix-ui/react-dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { set } from "date-fns"

interface Client {
  id: number;
  clientName: string;
  brand: string;
  phoneNumber: string;
  mobileNumber: string;
  location: {
    wilaya: string;
    daira: string;
    address: string;
  };
  existingClient: boolean; // New field to track if the client is existing
}



// Define types for our specific ticket type data
type NetworkCheckData = {
  ipAddress: string;
  signalStrength: string;
  connectionType: string;
  pingResult: string;
}

type UnblockingData = {
  blockedReason: string;
  previousAttempts: string;
  requiredAction: string;
  notes: string;
  terminal_types: { terminal_type_id: number; quantity: number }[];
  selectedBrand?: string;
  selectedModel?: string;
}

type InterventionData = {
  problemCategory: string;
  problemType: string;
  tpeBrand: string;
  tpeModel: string;
  tpeSn: string;
  terminal_type_id: number | null;
}

type ConsumableData = {
  items: {
    type: string;
    quantity: number;
    customType?: string;
  }[];
  tpeBrand: string;
  tpeModel: string;
  tpeSn: string;
  terminal_type_id: number | null;
}

export default function CreateTicketButton({ onCreate }: { onCreate?: () => void }) {
  const [activeTab, setActiveTab] = useState<'network' | 'unblocking' | 'intervention' | 'consumable'>('intervention');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [bankTicketId, setBankTicketId] = useState('')

  const [clientsfetch, setclientsfetch] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);

// Fix the wilaya selection state handling
const [client, setClient] = useState<Client>({
  id: 0,
  clientName: '',
  brand: '',
  phoneNumber: '',
  mobileNumber: '',
  location: { wilaya: '', daira: '', address: '' },
  existingClient: false, // New field to track if the client is existing
});

// Update the wilaya selection handler
const handleWilayaChange = (value: string) => {
  setClient(prev => ({
    ...prev,
    location: { 
      ...prev.location, 
      wilaya: value,
      daira: '' // Reset daira when wilaya changes
    }
  }));
};

// Update the daira selection handler
const handleDairaChange = (value: string) => {
  setClient(prev => ({
    ...prev,
    location: { 
      ...prev.location, 
      daira: value
    }
  }));
};


useEffect(() => {
  fetchClients()
    .then((res) => {
      setclientsfetch(res.data.clients || []);
    })
    .catch((err) => {
      console.error("Error fetching clients:", err);
      setclientsfetch([]);
    });
}, []);

useEffect(() => {
  if (selectedClient) {
    setClient({
      ...client,
      id: selectedClient.id,
      clientName: selectedClient.commercialName,
      brand: selectedClient.brand,
      phoneNumber: selectedClient.phoneNumber,
      location: {
        wilaya: selectedClient.location.wilaya,
        daira: selectedClient.location.daira,
        address: selectedClient.location.address,
      },

    });
  }
}, [selectedClient]);

const handleSelect = (id: number | string) => {
    const clientsel = clientsfetch.find(c => c.id === Number(id))
    if (clientsel) {
      setSelectedClient(clientsel)
    }
  }


  const [unblockingData, setUnblockingData] = useState({
    notes: "",
    blockedReason: "",
    previousAttempts: "",
    requiredAction: "",
    terminal_types: [] as { terminal_type_id: number; quantity: number }[],
    selectedBrand: "",
    selectedModel: ""
  });
  

 const [interventionData, setInterventionData] = useState<InterventionData>({
          problemCategory: '',
          problemType: '',
          tpeBrand: '',
          tpeModel: '',
          tpeSn: '',
          terminal_type_id: null
});

const [consumableData, setConsumableData] = useState<ConsumableData>({
  items: [],
  tpeBrand: '',
  tpeModel: '',
  tpeSn: '',
  terminal_type_id: null
});

const handleAddConsumable = () => {
  setConsumableData(prev => ({
    ...prev,
    items: [...prev.items, { type: '', quantity: 1 }]
  }));
};

const handleRemoveConsumable = (index: number) => {
  setConsumableData(prev => ({
    ...prev,
    items: prev.items.filter((_, i) => i !== index)
  }));
};

const handleConsumableItemChange = (index: number, field: string, value: string | number) => {
  setConsumableData(prev => ({
    ...prev,
    items: prev.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
  }));
};

const handleQuantityChange = (index: number, change: number) => {
  setConsumableData(prev => ({
    ...prev,
    items: prev.items.map((item, i) => {
      if (i === index) {
        const currentQty = item.quantity || 0;
        const newQty = Math.max(1, currentQty + change);
        return { ...item, quantity: newQty };
      }
      return item;
    })
  }));
};

// Duplicate function removed to fix redeclaration error.


  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [tpes, setTpes] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [availableConsumableItems, setAvailableConsumableItems] = useState<any[]>([]);
  const [selectedConsumableBrand, setSelectedConsumableBrand] = useState<any>(null);
  const [availableConsumableModels, setAvailableConsumableModels] = useState<any[]>([]);
  const [selectedUnblockingBrand, setSelectedUnblockingBrand] = useState<any>(null);
  const [availableUnblockingModels, setAvailableUnblockingModels] = useState<any[]>([]);

  useEffect(() => {
    // You may need to get the actual bank ID from context or props
    // For now using a default bank ID of 1
    fetchTPE()
      .then((res) => {
        setTpes(res.data || []); // New API structure
      })
      .catch((err) => {
        console.error("Error fetching TPEs:", err);
        setTpes([]);
      });

    // Fetch consumable items
    fetchConsumablesBankEmployee()
      .then((res) => {
        setAvailableConsumableItems(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching consumable items:", err);
        setAvailableConsumableItems([]);
      });
  }, []);
  
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])







 // Validation
// Enhanced validation function
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  if (activeTab !== 'unblocking') {

  // Common validation for all tabs
  if (!client.phoneNumber) {
    newErrors.phone = "Le numéro de téléphone est obligatoire.";
  } else if (!/^\+?\d{8,15}$/.test(client.phoneNumber)) {
    newErrors.phone = "Numéro de téléphone invalide.";
  }
  if( !client.clientName) newErrors.clientName = "Le nom du client est obligatoire.";
   if( !client.brand) newErrors.brand = "l'enseigne est obligatoire.";
   if( !client.brand) newErrors.brand = "l'enseigne est obligatoire.";
  if( !client.location.address) newErrors.address = "L'adresse est obligatoire.";
     }
  // Tab-specific validation
  switch (activeTab) {
    case 'network':
      // Add network-specific validation
      break;
      
    case 'unblocking':
      if (!unblockingData.blockedReason) {
        newErrors.blockedReason = "La raison du blocage est obligatoire.";
      }
      // TPE selection is now optional - no validation required
      break;
      
    case 'intervention':
      if (!interventionData.problemCategory) {
        newErrors.problemCategory = "La catégorie de problème est obligatoire.";
      }
      if (!interventionData.problemType) {
        newErrors.problemType = "Le type de problème est obligatoire.";
      }
      if (!interventionData.tpeBrand) {
        newErrors.tpeBrand = "La marque du TPE est obligatoire.";
      }
      if (!interventionData.tpeModel) {
        newErrors.tpeModel = "Le modèle du TPE est obligatoire.";
      }
      // Serial number is now optional - no validation required
      if (!interventionData.terminal_type_id) {
        newErrors.terminal_type_id = "Le type de terminal est obligatoire.";
      }
      break;
      
    case 'consumable':
      if (consumableData.items.length === 0) {
        newErrors.consumableItems = "Au moins un article consommable est requis.";
      } else {
        consumableData.items.forEach((item, index) => {
          if (!item.type) {
            newErrors[`item-${index}-type`] = "Le type est obligatoire.";
          }
          if (!item.quantity || item.quantity < 1) {
            newErrors[`item-${index}-quantity`] = "La quantité doit être d'au moins 1.";
          }
          if (item.type === 'other' && !item.customType) {
            newErrors[`item-${index}-customType`] = "Veuillez préciser le type.";
          }
        });
      }
      if (!consumableData.tpeBrand) {
        newErrors.consumableBrand = "La marque du TPE est obligatoire.";
      }
      if (!consumableData.tpeModel) {
        newErrors.consumableModel = "Le modèle du TPE est obligatoire.";
      }
      // Serial number is now optional - no validation required
      if (!consumableData.terminal_type_id) {
        newErrors.consumableTerminalId = "Le type de terminal est obligatoire.";
      }
      break;
  }
  
  // Location validation for all tabs except unblocking
  if (activeTab !== 'unblocking') {
    if (!client.location.wilaya) newErrors.wilaya = "La wilaya est obligatoire.";
    if (!client.location.daira) newErrors.daira = "La daira est obligatoire.";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


// Reset form state
const resetForm = () => {
  if (successTimeoutRef.current) {
    clearTimeout(successTimeoutRef.current)
    successTimeoutRef.current = null
  }
  setActiveTab('intervention')
  setClient({
    id: 0,
    clientName: '',
    brand: '',
    phoneNumber: '',
    mobileNumber: '',
    location: {
      wilaya: '',
      daira: '',
      address: ''
    },
    existingClient: false
  })
  setUnblockingData({
    blockedReason: '',
    notes: '',
    previousAttempts: '',
    requiredAction: '',
    terminal_types: [],
    selectedBrand: '',
    selectedModel: ''
  })
  setInterventionData({
    problemCategory: '',
    problemType: '',
    tpeBrand: '',
    tpeModel: '',
    tpeSn: '',
    terminal_type_id: null
  })
  setSelectedBrand(null)
  setAvailableModels([])
  setConsumableData({
    items: [],
    tpeBrand: '',
    tpeModel: '',
    tpeSn: '',
    terminal_type_id: null
  })
  setSelectedConsumableBrand(null)
  setAvailableConsumableModels([])
  setSelectedUnblockingBrand(null)
  setAvailableUnblockingModels([])
  setPhoto(null)
  setPreview(null)
  setErrors({})
  setSuccessMessage('')
  setShowSuccessOverlay(false)
  setDescription('')
  setBankTicketId('')
  setIsSubmitting(false)
}

const handleModalOpenChange = (open: boolean) => {
  if (!open) {
    resetForm()
  } else {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    setSuccessMessage('')
    setShowSuccessOverlay(false)
  }
  setIsModalOpen(open)
}

// Handle Submit
const handleSubmit = async () => {
  if (!validateForm() || isSubmitting) return false;
  
  setIsSubmitting(true);
  
  try {
    const basePayload = {
      new_client: !client.existingClient,
      client_id: client.existingClient ? client.id : undefined,
      client_commercialName: client.clientName,
      client_phoneNumber: client.phoneNumber,
      client_brand: client.brand,
      client_wilaya: client.location.wilaya,
      client_daira: client.location.daira,
      client_address: client.location.address,
      notes: description,
      bankTicketId: bankTicketId || undefined,
    };
    
    switch (activeTab) {
      case 'network':
        await createNetworkCheckTicket(basePayload);
        break;
        
      case 'intervention':
        await createInterventionTicket({
          ...basePayload,
          terminal_type_id: interventionData.terminal_type_id || 0,
          problem_description: `${interventionData.problemCategory} - ${interventionData.problemType}`,
          tpe_seriel_number: interventionData.tpeSn || undefined
        });
        break;
        
      case 'unblocking':
        await createDeblockingTicket({
          notes: description,
          deblockingType: unblockingData.blockedReason,
          terminal_types: unblockingData.terminal_types,
          bankTicketId: bankTicketId || undefined,
        });
        break;
        
      case 'consumable':
        await createConsumableTicket({
          ...basePayload,
          terminal_type_id: consumableData.terminal_type_id || 0,
          consumables: consumableData.items.map(item => ({
            type: item.type === 'other' ? (item.customType || 'Autre') : item.type,
            quantity: item.quantity
          })),
          tpe_seriel_number: consumableData.tpeSn || undefined
        });
        break;
    }
    
    setSuccessMessage("Ticket créé avec succès !");
    setShowSuccessOverlay(true);

    if (onCreate) {
      onCreate();
    }

    successTimeoutRef.current = setTimeout(() => {
      setIsModalOpen(false);
    }, 1200);

    return false;
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la création du ticket.");
    return false;
  } finally {
    setIsSubmitting(false);
  }
};


 
  const handleUnblockingDataChange = (field: keyof UnblockingData, value: string) => {
    setUnblockingData(prev => ({ ...prev, [field]: value }))
  }

 const handleInterventionDataChange = (field: keyof InterventionData, value: string | number) => {
  setInterventionData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Handle brand selection change for intervention
const handleInterventionBrandChange = (brandName: string) => {
  const brand = tpes.find((b: any) => b.manufacturer === brandName);
  setSelectedBrand(brand);
  setAvailableModels(brand?.models || []);
  
  // Update intervention data
  setInterventionData(prev => ({
    ...prev,
    tpeBrand: brandName,
    tpeModel: '',
    terminal_type_id: null
  }));
};

// Handle model selection change for intervention
const handleInterventionModelChange = (modelName: string) => {
  const selectedModel = availableModels.find((model: any) => model.model === modelName);
  
  setInterventionData(prev => ({
    ...prev,
    tpeModel: modelName,
    terminal_type_id: selectedModel?.id || null
  }));
};

// Handle brand selection change for consumable
const handleConsumableBrandChange = (brandName: string) => {
  const brand = tpes.find((b: any) => b.manufacturer === brandName);
  setSelectedConsumableBrand(brand);
  setAvailableConsumableModels(brand?.models || []);
  
  // Update consumable data
  setConsumableData(prev => ({
    ...prev,
    tpeBrand: brandName,
    tpeModel: '',
    terminal_type_id: null
  }));
};

// Handle model selection change for consumable
const handleConsumableModelChange = (modelName: string) => {
  const selectedModel = availableConsumableModels.find((model: any) => model.model === modelName);
  
  setConsumableData(prev => ({
    ...prev,
    tpeModel: modelName,
    terminal_type_id: selectedModel?.id || null
  }));
};

// Handle brand selection change for unblocking
const handleUnblockingBrandChange = (brandName: string) => {
  const brand = tpes.find((b: any) => b.manufacturer === brandName);
  setSelectedUnblockingBrand(brand);
  setAvailableUnblockingModels(brand?.models || []);
  
  // Update unblocking data
  setUnblockingData(prev => ({
    ...prev,
    selectedBrand: brandName,
    selectedModel: '',
    selectedSerial: ''
  }));
};

// Handle model selection change for unblocking
const handleUnblockingModelChange = (modelName: string) => {
  const selectedModel = availableUnblockingModels.find((model: any) => model.model === modelName);
  
  setUnblockingData(prev => ({
    ...prev,
    selectedModel: modelName
  }));
};

  const handleConsumableDataChange = (field: keyof ConsumableData, value: any) => {
    setConsumableData(prev => ({
      ...prev,
      [field]: field === "items" ? value as ConsumableData["items"] : value
    }));
  }

  // Tab configuration
  const tabs = [
    { id: 'intervention', label: 'Intervention', icon: <FaTools /> },
    { id: 'consumable', label: 'Consommable', icon: <FaBoxOpen /> },
    { id: 'network', label: 'Choix de réseau', icon: <FaNetworkWired /> },
    { id: 'unblocking', label: 'Déblocage', icon: <FaUnlock /> },
  ]

  return (
    <DynamicModal
      triggerLabel="Nouvelle demande"
      title="Nouveau Demande"
      description="Signalez un problème ou demandez une maintenance."
      onConfirm={handleSubmit}
      open={isModalOpen}
      onOpenChange={handleModalOpenChange}
      confirmLabel={isSubmitting ? "Création en cours..." : "Soumettre le ticket"}
    >
      <div className="space-y-6 relative">
        {showSuccessOverlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
            <div className="relative max-w-md space-y-4 rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-8 text-center shadow-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/50">
                <FaCheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-emerald-800">{successMessage}</p>
                <p className="text-sm text-emerald-700">
                  Votre demande vient d'être enregistrée. Nous prenons le relais immédiatement — cette fenêtre va se fermer automatiquement.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <div className="text-lg font-semibold text-blue-700">Création du ticket en cours...</div>
              <div className="text-sm text-gray-600">Veuillez patienter, ne fermez pas cette fenêtre</div>
            </div>
          </div>
        )}
        
        {/* Ticket Type Tabs */}
     <h1 className=" font-bold text-red-600">Choisir le type de demande * : </h1>

  <nav className="relative bg-white/80 backdrop-blur-sm rounded-xl p-1  border shadow-lg border-gray-200/50">

    <div className="flex gap-2  space-x-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`
            relative py-3  px-4 text-sm cursor-pointer font-medium flex items-center gap-2 
            transition-all duration-300 ease-in-out rounded-lg
            ${activeTab === tab.id
              ? 'text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-900 bg-blue-200/40 hover:bg-blue-600/30'
            }
          `}
        >

          {/* Background for active tab with gradient */}
          {activeTab === tab.id && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg z-0"></div>
          )}
          
          {/* Animated circle indicator for active tab */}
          {activeTab === tab.id && (
            <div className="absolute -top-1 -right-1">
              <div className="relative">
                <div className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></div>
              </div>
            </div>
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
          
          {/* Hover effect for inactive tabs */}
          {activeTab !== tab.id && (
            <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          )}
        </button>

      ))}
    </div>
    
   
  </nav>
  


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Common Fields */}
          {activeTab !== 'unblocking' && (
            <>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4  rounded-lg">
               <div className="flex flex-col col-span-2">
{/* Checkbox: existing client */}
<div className="flex items-center gap-2">
  <label className="text-xl mb-2 font-bold text-blue-700">
    client existant ? :
  </label>
  <Checkbox
    className="checked:bg-blue-500"
    checked={client.existingClient}
    onCheckedChange={(checked) =>
      setClient({ ...client, existingClient: !!checked })
    }
  >
    Oui
  </Checkbox>
</div>

{/* If existing client → show select */}
{client.existingClient && (
  <div className="flex items-center  gap-2">
    <label className="text-sm py-4 font-bold text-blue-700">
      Choisir un client :
    </label>
    <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-xs">
        <SelectValue placeholder="Choose a client" />
      </SelectTrigger>
      <SelectContent >
        {clientsfetch.map((c: any) => (
          <SelectItem key={c.id} value={c.id.toString()}>
            {c.commercialName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

               </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Nom du client :</label>
                  <Input
                    type="text"
                    placeholder="Mohamed Amine"
                    className="w-full"
                      disabled={client.existingClient}   // 🔒 block editing

                    value={client.clientName}
                    onChange={(e) => setClient({ ...client, clientName: e.target.value })}
                  />
                  {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                </div>
             

                {/* Téléphone */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Téléphone :</label>
<Input
  type="text"
  placeholder="+213650000000"
  className="w-full"
    disabled={client.existingClient}   // 🔒 block editing

  value={client.phoneNumber}
  onChange={(e) => setClient({ ...client, phoneNumber: e.target.value })}
                />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}

                </div>
                {/* Nom de l'enseigne */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Nom de l'enseigne :</label>
                  <Input
                    type="text"
                    placeholder="Magasin Central"
                    className="w-full"
                      disabled={client.existingClient}   // 🔒 block editing

                    value={client.brand}
                    onChange={(e) => setClient({ ...client, brand: e.target.value })}
                  />
                  {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                </div>
        



               {/* Wilaya Selection */}
<div className="flex flex-col">
  <label className="text-sm font-medium mb-2">Wilaya :</label>
  <Select
    value={client.location.wilaya}
    onValueChange={handleWilayaChange}
    disabled={client.existingClient}   // 🔒 block editing
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="-- Sélectionnez une wilaya --" />
    </SelectTrigger>
    <SelectContent>
      {Object.keys(wilayas).map((w) => (
        <SelectItem key={w} value={w}>
          {w}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
</div>

{/* Daira Selection */}
<div className="flex flex-col">
  <label className="text-sm font-medium mb-2">Daira :</label>
  <Select
    value={client.location.daira}
    onValueChange={handleDairaChange}
    disabled={!client.location.wilaya || client.existingClient}  
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="-- Sélectionnez une daira --" />
    </SelectTrigger>
  <SelectContent>
  {client?.location?.wilaya &&
    wilayas[client.location.wilaya]?.map((d) => (
      <SelectItem key={d} value={d}>
        {d}
      </SelectItem>
    ))}
</SelectContent>

  </Select>
  {errors.daira && <p className="text-red-500 text-xs mt-1">{errors.daira}</p>}
</div>

                {/* Adresse */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Adresse :</label>
<Input
  type="text"
  placeholder="Adresse"
  className="w-full"
    disabled={client.existingClient}   // 🔒 block editing

  value={client.location.address}
  onChange={(e) => setClient({ ...client, location: { ...client.location, address: e.target.value } })}
                />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </>
          )}

          {/* Type-Specific Fields */}
          {activeTab !== 'network' && (
          <div className="md:col-span-2 p-4  rounded-lg">
          
      
            {activeTab === 'unblocking' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">Raison du blocage :</label>
                    <Select
                      onValueChange={(value) => handleUnblockingDataChange('blockedReason', value)}
                      value={unblockingData.blockedReason}

                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une raison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INSTALLATION">INSTALLATION</SelectItem>
                        <SelectItem value="REPLACEMENT">REPLACEMENT</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.blockedReason && <p className="text-red-500 text-xs mt-1">{errors.blockedReason}</p>}
                  </div>




                </div>

{/* TPE Management Section */}
<div className="border-t pt-6 mt-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="font-medium text-lg">Gestion des TPE (Optionnel)</h3>
    <span className="text-sm text-gray-500">Vous pouvez ajouter des informations TPE si nécessaire</span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Marque */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2">Marque :</label>
      <Select
        value={unblockingData.selectedBrand || ""}
        onValueChange={handleUnblockingBrandChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez une marque (optionnel)" />
        </SelectTrigger>
        <SelectContent>
          {tpes.map((brand: any) => (
            <SelectItem key={brand.manufacturer_id} value={brand.manufacturer}>
              {brand.manufacturer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Modèle */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2">Modèle :</label>
      <Select
        value={unblockingData.selectedModel || ""}
        onValueChange={handleUnblockingModelChange}
        disabled={!selectedUnblockingBrand || availableUnblockingModels.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un modèle (optionnel)" />
        </SelectTrigger>
        <SelectContent>
          {availableUnblockingModels.map((model: any) => (
            <SelectItem key={model.id} value={model.model}>
              {model.model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Add TPE Button */}
  {unblockingData.selectedBrand && unblockingData.selectedModel && (
    <div className="mt-4">
      <Button
        type="button"
        onClick={() => {
          const selectedModel = availableUnblockingModels.find((model: any) => model.model === unblockingData.selectedModel);
          if (selectedModel) {
            setUnblockingData(prev => ({
              ...prev,
              terminal_types: [...prev.terminal_types, { terminal_type_id: selectedModel.id, quantity: 1 }],
              selectedBrand: '',
              selectedModel: ''
            }));
            setSelectedUnblockingBrand(null);
            setAvailableUnblockingModels([]);
          }
        }}
        className="flex items-center gap-2"
        variant="outline"
      >
        <FaPlus className="text-sm" />
        Ajouter ce TPE
      </Button>
    </div>
  )}

  {/* Selected TPEs list */}
  {unblockingData.terminal_types.length > 0 && (
    <div className="mt-6 space-y-2">
      <h4 className="font-medium text-gray-700">TPE sélectionnés :</h4>
      {unblockingData.terminal_types.map((terminalType, index) => {
        const fullModel = tpes
          .flatMap(brand => brand.models)
          .find((model: any) => model.id === terminalType.terminal_type_id);
        const brand = tpes.find((b: any) => b.models.some((m: any) => m.id === terminalType.terminal_type_id));
        
        return (
          <div
            key={index}
            className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <span>
                {brand?.manufacturer} – {fullModel?.model} (ID: {terminalType.terminal_type_id})
              </span>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Quantité:</label>
                <Input
                  type="number"
                  min="1"
                  value={terminalType.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 1;
                    setUnblockingData((prev) => ({
                      ...prev,
                      terminal_types: prev.terminal_types.map((item, i) => 
                        i === index ? { ...item, quantity: newQuantity } : item
                      ),
                    }));
                  }}
                  className="w-20 text-center"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setUnblockingData((prev) => ({
                  ...prev,
                  terminal_types: prev.terminal_types.filter((_, i) => i !== index),
                }))
              }
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>



              </div>
            )}

{activeTab === 'intervention' && (
  <div className="space-y-6">
    {/* Problem Type Section */}
    <div className="bg-white p-4  border-t  ">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
        <FaExclamationTriangle className="text-orange-500" />
        Type de problème
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Catégorie de problème :</label>
          <Select
            onValueChange={(value) => handleInterventionDataChange('problemCategory', value)}
            value={interventionData.problemCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hardware">Matériel</SelectItem>
              <SelectItem value="software">Application</SelectItem>
              <SelectItem value="network">Réseau</SelectItem>
              <SelectItem value="mechanical">Non Qualifié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {interventionData.problemCategory !== "mechanical" && (
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Type de problème :</label>
            <Select
              onValueChange={(value) => handleInterventionDataChange('problemType', value)}
              value={interventionData.problemType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                {interventionData.problemCategory === "hardware" && (
                <>
                  <SelectItem value="screen_issue">Problème d'écran</SelectItem>
                  <SelectItem value="printer_issue">Problème d'imprimante</SelectItem>
                  <SelectItem value="card_reader_issue">Problème de lecteur de carte</SelectItem>
                  <SelectItem value="power_issue">Problème d'alimentation</SelectItem>
                </>
              )}
              {interventionData.problemCategory === "software" && (
                <>
                  <SelectItem value="os_issue">Problème du système d'exploitation</SelectItem>
                  <SelectItem value="application_issue">Problème d'application</SelectItem>
                  <SelectItem value="configuration_issue">Problème de configuration</SelectItem>
                  <SelectItem value="update_issue">Problème de mise à jour</SelectItem>
                </>
              )}
              {interventionData.problemCategory === "network" && (
                <>
                  <SelectItem value="connectivity_issue">Problème de connectivité</SelectItem>
                  <SelectItem value="slow_connection">Connexion lente</SelectItem>
                  <SelectItem value="vpn_issue">Problème VPN</SelectItem>
                  <SelectItem value="firewall_issue">Problème de firewall</SelectItem>
                </>
              )}
              {interventionData.problemCategory === "mechanical" && (
                <>
                  <SelectItem value="keyboard_issue">Problème de clavier</SelectItem>
                  <SelectItem value="mechanical_part">Pièce mécanique défectueuse</SelectItem>
                  <SelectItem value="jam_issue">Problème de bourrage papier</SelectItem>
                  <SelectItem value="worn_part">Pièce usée</SelectItem>
                </>
              )}
             {!interventionData.problemCategory && (
  <SelectItem value="no-category" disabled>
    Sélectionnez d'abord une catégorie
  </SelectItem>
)}

            </SelectContent>
          </Select>
          {errors.problemType && <p className="text-red-500 text-xs mt-1">{errors.problemType}</p>}
        </div>
        )}
      </div>
    </div>

    {/* TPE Information Section */}
    <div className="bg-white p-4  ">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
        <FaCreditCard className="text-blue-500" />
        Informations TPE
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Marque */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Marque :</label>
          <Select
            value={interventionData.tpeBrand}
            onValueChange={handleInterventionBrandChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une marque" />
            </SelectTrigger>
            <SelectContent>
              {tpes.map((brand: any) => (
                <SelectItem key={brand.manufacturer_id} value={brand.manufacturer}>
                  {brand.manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tpeBrand && <p className="text-red-500 text-xs mt-1">{errors.tpeBrand}</p>}
        </div>

        {/* Modèle */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Modèle :</label>
          <Select
            value={interventionData.tpeModel}
            onValueChange={handleInterventionModelChange}
            disabled={!selectedBrand || availableModels.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model: any) => (
                <SelectItem key={model.id} value={model.model}>
                  {model.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tpeModel && <p className="text-red-500 text-xs mt-1">{errors.tpeModel}</p>}
        </div>

        {/* Numéro de série - Manual Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Numéro de série :</label>
          <Input
            type="text"
            placeholder="Entrez le numéro de série"
            value={interventionData.tpeSn}
            onChange={(e) => handleInterventionDataChange('tpeSn', e.target.value)}
            className="w-full"
          />
          {errors.tpeSn && <p className="text-red-500 text-xs mt-1">{errors.tpeSn}</p>}
        </div>
      </div>

        
       
      </div>
    </div>

)}

          {activeTab === 'consumable' && (
  <div className="space-y-6">

    {/* TPE Information Section for Consumable */}
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
        <FaCreditCard className="text-blue-500" />
        Informations TPE
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Marque */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Marque :</label>
          <Select
            value={consumableData.tpeBrand}
            onValueChange={handleConsumableBrandChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une marque" />
            </SelectTrigger>
            <SelectContent>
              {tpes.map((brand: any) => (
                <SelectItem key={brand.manufacturer_id} value={brand.manufacturer}>
                  {brand.manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.consumableBrand && <p className="text-red-500 text-xs mt-1">{errors.consumableBrand}</p>}
        </div>

        {/* Modèle */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Modèle :</label>
          <Select
            value={consumableData.tpeModel}
            onValueChange={handleConsumableModelChange}
            disabled={!selectedConsumableBrand || availableConsumableModels.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              {availableConsumableModels.map((model: any) => (
                <SelectItem key={model.id} value={model.model}>
                  {model.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.consumableModel && <p className="text-red-500 text-xs mt-1">{errors.consumableModel}</p>}
        </div>

        {/* Numéro de série - Manual Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Numéro de série :</label>
          <Input
            type="text"
            placeholder="Entrez le numéro de série"
            value={consumableData.tpeSn}
            onChange={(e) => setConsumableData(prev => ({ ...prev, tpeSn: e.target.value }))}
            className="w-full"
          />
          {errors.consumableSn && <p className="text-red-500 text-xs mt-1">{errors.consumableSn}</p>}
        </div>
      </div>

      {/* TPE Details Summary */}
      {consumableData.tpeBrand && consumableData.tpeModel && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" />
            Détails du TPE sélectionné
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Marque:</span>
              <p className="text-blue-900">{consumableData.tpeBrand}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Modèle:</span>
              <p className="text-blue-900">{consumableData.tpeModel}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">N° de série:</span>
              <p className="text-blue-900">{consumableData.tpeSn || 'Non renseigné'}</p>
            </div>
   
          </div>
        </div>
      )}
    </div>

  {/* Consumable Items Section */}
  <div className="bg-white p-4 rounded-lg border shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
        <FaBoxOpen className="text-purple-500" />
          Articles consommables
        </h3>
        <Button 
          type="button" 
          onClick={() => handleAddConsumable()}
          className="flex items-center gap-2"
          variant="outline"
        >
          <FaPlus className="text-sm" />
          Ajouter un article
        </Button>
      </div>

      {consumableData.items && consumableData.items.length > 0 ? (
        <div className="space-y-4">
          {consumableData.items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
              <button
                type="button"
                onClick={() => handleRemoveConsumable(index)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <FaTrash className="text-sm" />
              </button>
              
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FaBox className="text-gray-500" />
                Article #{index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Type de consommable :</label>
                  <Select
                    onValueChange={(value) => handleConsumableItemChange(index, 'type', value)}
                    value={item.type}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableConsumableItems.map((consumable: any) => (
                        <SelectItem key={consumable.id} value={consumable.type}>
                          {consumable.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`item-${index}-type`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item-${index}-type`]}</p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Quantité :</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleQuantityChange(index, -1)}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <FaMinus className="text-sm" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleConsumableItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => handleQuantityChange(index, 1)}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <FaPlus className="text-sm" />
                    </Button>
                  </div>
                  {errors[`item-${index}-quantity`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item-${index}-quantity`]}</p>
                  )}
                </div>

                {item.type === 'other' && (
                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-sm font-medium mb-2">Précisez le type :</label>
                    <Input
                      type="text"
                      placeholder="Spécifiez le type de consommable"
                      value={item.customType || ''}
                      onChange={(e) => handleConsumableItemChange(index, 'customType', e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border-2 border-dashed rounded-lg bg-gray-50">
          <FaInfoCircle className="mx-auto text-gray-400 text-2xl mb-2" />
          <p className="text-gray-500">Aucun article ajouté. Cliquez sur "Ajouter un article" pour commencer.</p>
        </div>
      )}
    </div>



    {/* Summary */}
    {consumableData.items && consumableData.items.length > 0 && (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-800">
          <FaClipboardCheck className="text-blue-500" />
          Récapitulatif
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Total des articles :</p>
            <p className="text-lg font-bold text-blue-900">
              {consumableData.items.reduce((total, item) => total + (item.quantity || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Types demandés :</p>
            <p className="text-sm text-blue-900">
              {Array.from(new Set(consumableData.items.map(item => 
                item.type === 'other' ? (item.customType || 'Autre') : item.type
              ))).join(', ')}
            </p>
          </div>
        </div>
      </div>
    )}
                
  </div>
)}
          </div>
  )}
          {/* Bank Ticket ID (optional, common to all types) */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium mb-2">
              ID du ticket bancaire (optionnel) :
            </label>
            <Input
              type="text"
              placeholder="Ex: BNK-2025-001234"
              value={bankTicketId}
              onChange={(e) => setBankTicketId(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Référence du ticket fournie par la banque (si disponible)
            </p>
          </div>

          {/* Description (common to all types) */}
          <div className="md:col-span-2 flex flex-col">
            <label className="text-sm font-medium mb-2">Description :</label>
            <Textarea
              placeholder="Décrivez le problème ou la demande en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              rows={4}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>
      </div>
    </DynamicModal>
  )
}