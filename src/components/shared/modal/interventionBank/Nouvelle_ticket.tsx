'use client'

import { useState, useEffect, useCallback } from "react"
import { DynamicModal } from '../Modal'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FaExchangeAlt, FaTrash, FaNetworkWired, FaUnlock, FaTools, FaBoxOpen } from 'react-icons/fa'
import { MdOutlineUploadFile } from 'react-icons/md'
import { wilayas } from "@/constants/algeria/wilayas"
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import { Button } from "@/components/ui/button"
import { FaExclamationTriangle, FaCreditCard, FaClipboardList } from 'react-icons/fa';
import { FaBox, FaClipboardCheck,  FaMinus  } from 'react-icons/fa';
import { clientfetch, createConsumableTicket, createDeblockingTicket, createInterventionTicket, createNetworkCheckTicket, fetchbanks, fetchClients, terminalperbankfetch, fetchConsumables, CreateNetworkCheckAccountManager, CreateinterventionAccountManager, CreateDeblockingAccountManager, CreateconsumableAccountManager } from "@/app/api/tickets"
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

// API response structure for clients
interface APIClient {
  id: number;
  commercialName: string;
  brand: string;
  phoneNumber: string;
  mobileNumber: string;
  contactName: string;
  contractNumber: string;
  bankId: number;
  location: {
    wilaya: string;
    daira: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
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
  terminal_types: {
    terminal_type_id: number;
  }[];
}

type InterventionData = {
  problemCategory: string;
  problemType: string;
  tpeBrand: string;
  terminal_type_id: number | null;
}

type ConsumableData = {
  items: {
    type: string;
    quantity: number;
    customType?: string;
  }[];
}

type banksinfo={
  bankid:number;
  BankName:string;
}

type BankInfo = {
  id: number;
  name: string;
};

type TPEModel = {
  id: number;
  model: string;
  description: string;
};

type TPEManufacturer = {
  manufacturer_id: number;
  manufacturer: string;
  models: TPEModel[];
};

type FlatTPE = {
  id: number;
  manufacturer: string;
  manufacturer_id: number;
  model: string;
  description: string;
};

// Consumable type from API
type ConsumableType = {
  id: number;
  type: string;
  quantity: number;
};

export default function CreateTicketButton({ onCreate }: { onCreate?: () => void }) {
  const [activeTab, setActiveTab] = useState<'network' | 'unblocking' | 'intervention' | 'consumable'>('intervention');

  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')

  const [clientsfetch, setclientsfetch] = useState<APIClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<APIClient | null>(null)


  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);

  
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
  fetchbanks()
    .then((res) => {
      // assuming API returns { banks: [{ id, name }, ...] }
      setBanks(res.data.banks || []);
    })
    .catch((err) => {
      console.error("Error fetching banks:", err);
      setBanks([]);
    });
}, []);

// Separate useEffect to fetch clients when a bank is selected
useEffect(() => {
  if (selectedBank?.id) {
    clientfetch(selectedBank.id)
      .then((res) => {
        setclientsfetch(res.data.clients || []);
      })
      .catch((err) => {
        console.error("Error fetching clients:", err);
        setclientsfetch([]);
      });
  } else {
    setclientsfetch([]);
  }
}, [selectedBank?.id]);

useEffect(() => {
  if (selectedClient) {
    setClient({
      ...client,
      id: selectedClient.id,
      clientName: selectedClient.commercialName,
      brand: selectedClient.brand,
      phoneNumber: selectedClient.phoneNumber,
      mobileNumber: selectedClient.mobileNumber,
      location: {
        wilaya: selectedClient.location.wilaya,
        daira: selectedClient.location.daira,
        address: selectedClient.location.address
      },
      existingClient: true
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
    terminal_types: [] as { terminal_type_id: number }[],   // changed from tpes to terminal_types
    selectedBrand: "",
    selectedModel: "",
  });
  

 const [interventionData, setInterventionData] = useState<InterventionData>({
          problemCategory: '',
          problemType: '',
          tpeBrand: '',
          terminal_type_id: null
});

const [consumableData, setConsumableData] = useState<ConsumableData>({
  items: [],
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

const handleConsumableItemChange = (index: number, field: string, value: string) => {
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

  const [tpes, setTpes] = useState<FlatTPE[]>([]);
  const [consumableTypes, setConsumableTypes] = useState<ConsumableType[]>([]);
  const [loadingConsumables, setLoadingConsumables] = useState(false);

  useEffect(() => {
    if (selectedBank?.id) {
      terminalperbankfetch(selectedBank.id)
        .then((res) => {
          // Transform the manufacturer/models structure into a flat array for easier use
          const flatTpes: FlatTPE[] = [];
          const manufacturers: TPEManufacturer[] = res.data || [];
          
          manufacturers.forEach(manufacturer => {
            manufacturer.models.forEach(model => {
              flatTpes.push({
                id: model.id,
                manufacturer: manufacturer.manufacturer,
                manufacturer_id: manufacturer.manufacturer_id,
                model: model.model,
                description: model.description
              });
            });
          });
          
          setTpes(flatTpes);
        })
        .catch((err) => {
          console.error("Error fetching TPEs:", err);
          setTpes([]);
        });
    } else {
      setTpes([]);
    }
  }, [selectedBank?.id]);

  // Fetch consumable types when component mounts
  useEffect(() => {
    const loadConsumableTypes = async () => {
      try {
        setLoadingConsumables(true);
        const response = await fetchConsumables();
        // Handle the API response structure - it could be either direct array or nested in data
        const consumableArray = response.data?.consumables || response.data || response || [];
        
        // Transform the data to match our expected structure
        const transformedConsumables = consumableArray.map((item: any) => ({
          id: item.id || 0,
          type: item.type || item.name || item.consumableType || 'Type inconnu',
          quantity: item.quantity || item.stock || 0
        }));
        
        setConsumableTypes(transformedConsumables);
        console.log("✅ Consumable types loaded:", transformedConsumables);
        console.log("✅ Raw API response:", response);
      } catch (err) {
        console.error("❌ Error fetching consumable types:", err);
        setConsumableTypes([]);
      } finally {
        setLoadingConsumables(false);
      }
    };
    
    loadConsumableTypes();
  }, []);
  






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
  if (!description) newErrors.description = "La description est obligatoire.";
  
  // Tab-specific validation
  switch (activeTab) {
    case 'network':
      // Add network-specific validation
      break;
      
    case 'unblocking':
      if (!unblockingData.blockedReason) {
        newErrors.blockedReason = "La raison du blocage est obligatoire.";
      }
      if (unblockingData.terminal_types.length === 0) {
        newErrors.tpes = "Veuillez ajouter au moins un TPE.";
      }
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
      if (!interventionData.terminal_type_id) {
        newErrors.tpeModel = "Le modèle du TPE est obligatoire.";
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
          if (item.type === 'AUTRE' && !item.customType) {
            newErrors[`item-${index}-customType`] = "Veuillez préciser le type.";
          }
        });
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
    terminal_types: [],
    selectedBrand: '',
    selectedModel: ''
  })
  setInterventionData({
    problemCategory: '',
    problemType: '',
    tpeBrand: '',
    terminal_type_id: null
  })
  setConsumableData({
    items: []
  })
  setPhoto(null)
  setPreview(null)
  setErrors({})
  setSuccessMessage('')
}

// Handle Submit
const handleSubmit = async () => {
  if (!validateForm()) return false;
  
  try {
  
    const basePayload = {
      bank_id: selectedBank ? selectedBank.id : null,
      new_client: !client.existingClient,
      client_id: client.existingClient ? client.id : undefined,
      client_commercialName: client.clientName,
      client_phoneNumber: client.phoneNumber,
      client_brand: client.brand,
      client_wilaya: client.location.wilaya,
      client_daira: client.location.daira,
      client_address: client.location.address,
      notes: description,
    };
    
    switch (activeTab) {
      case 'network':
        await CreateNetworkCheckAccountManager(basePayload);
        break;
        
      case 'intervention':
        await CreateinterventionAccountManager({
          ...basePayload,
          terminal_type_id: interventionData.terminal_type_id!,
          problem_description: `${interventionData.problemCategory} - ${interventionData.problemType}`
        });
        break;
        
      case 'unblocking':
        await CreateDeblockingAccountManager({
          bank_id: selectedBank ? selectedBank.id : null,
          notes: description,
          deblockingType: unblockingData.blockedReason,
          terminal_types: unblockingData.terminal_types.map(t => t.terminal_type_id),
        });
        break;
        
      case 'consumable':
        await CreateconsumableAccountManager({
          ...basePayload,
          consumables: consumableData.items.map(item => ({
            type: item.type === 'AUTRE' ? item.customType || 'Autre' : item.type,
            quantity: item.quantity
          })),
        });
        break;
    }
    
    resetForm();
    setSuccessMessage("✅ Ticket créé avec succès !");
    return false;
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la création du ticket.");
    return false;
  }
};


 
  const handleUnblockingDataChange = (field: keyof UnblockingData, value: string) => {
    setUnblockingData(prev => ({ ...prev, [field]: value }))
  }

 const handleInterventionDataChange = (field: keyof InterventionData, value: string) => {
  setInterventionData(prev => ({
    ...prev,
    [field]: value
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
      onClose={resetForm}
      confirmLabel="Soumettre le ticket"
    >
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
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

{/* Bank Selection */}
<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4  rounded-lg">
 <div className="flex flex-col gap-1">
 <label className="text-sm font-medium mb-2">Banque :</label>
<Select
  onValueChange={(value) => {
    const bank = banks.find((b) => b.id.toString() === value);
    if (bank) {
      setSelectedBank({ id: bank.id, name: bank.name }); // store only id + name
    } else {
      setSelectedBank(null);
    }
  }}
  value={selectedBank?.id?.toString() || ""} 
>

    <SelectTrigger className="w-full">
      <SelectValue placeholder="-- Sélectionnez une banque --" />
    </SelectTrigger>
    <SelectContent>
      {banks.map((b) => (
        <SelectItem key={b.id} value={b.id.toString()}>
          {b.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
 </div>

</div>



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
    {!selectedBank ? (
      <div className="text-sm text-gray-500 italic">
        Veuillez d'abord sélectionner une banque
      </div>
    ) : clientsfetch.length === 0 ? (
      <div className="text-sm text-gray-500 italic">
        Chargement des clients...
      </div>
    ) : (
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-xs">
          <SelectValue placeholder="Choisir un client" />
        </SelectTrigger>
        <SelectContent >
          {clientsfetch.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.commercialName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
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
    <h3 className="font-medium text-lg">Gestion des TPE</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Marque */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2">Marque :</label>
      <Select
        onValueChange={(value) => {
          setUnblockingData((prev) => ({
            ...prev,
            selectedBrand: value,
            selectedModel: "",
          }));
        }}
        value={unblockingData.selectedBrand || ""}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez une marque" />
        </SelectTrigger>
        <SelectContent>
          {[...new Set(tpes.map((t) => t.manufacturer))].map((brand) => (
            <SelectItem key={brand} value={brand}>
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Modèle */}
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2">Modèle :</label>
      <Select
        onValueChange={(value) => {
          setUnblockingData((prev) => ({
            ...prev,
            selectedModel: value,
          }));
        }}
        value={unblockingData.selectedModel || ""}
        disabled={!unblockingData.selectedBrand}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un modèle" />
        </SelectTrigger>
        <SelectContent>
          {tpes
            .filter((t) => t.manufacturer === unblockingData.selectedBrand)
            .map((t) => t.model)
            .filter((v, i, arr) => arr.indexOf(v) === i) // unique
            .map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>

    {/* Numéro de Série */}
   {/* Numéro de Série */}
<div className="flex flex-col">
  <label className="text-sm font-medium mb-2">Sélectionner TPE :</label>
  <Select
    onValueChange={(value) => {
      const selected = tpes.find((t) => String(t.id) === value);
      if (!selected) return;

      setUnblockingData((prev) => ({
        ...prev,
        terminal_types: [...prev.terminal_types, { terminal_type_id: selected.id }], // ✅ real ID
      }));
    }}
    disabled={!unblockingData.selectedModel}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Sélectionnez un TPE" />
    </SelectTrigger>
    <SelectContent>
      {tpes
        .filter(
          (t) =>
            t.manufacturer === unblockingData.selectedBrand &&
            t.model === unblockingData.selectedModel
        )
        .map((t) => (
          <SelectItem key={t.id} value={String(t.id)}>
            {t.manufacturer} - {t.model}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>

  </div>

  {/* Selected TPEs list */}
  {unblockingData.terminal_types.length > 0 && (
    <div className="mt-6 space-y-2">
      {unblockingData.terminal_types.map((terminalType, index) => {
        const fullTpe = tpes.find((t) => t.id === terminalType.terminal_type_id);
        return (
          <div
            key={index}
            className="flex justify-between items-center p-3 border rounded-lg"
          >
            <span>
              {fullTpe?.manufacturer} – {fullTpe?.model}
            </span>
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
              <SelectItem value="software">Logiciel</SelectItem>
              <SelectItem value="network">Réseau</SelectItem>
              <SelectItem value="mechanical">Mécanique</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </div>
    </div>

    {/* TPE Information Section */}
    <div className="bg-white p-4  ">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
        <FaCreditCard className="text-blue-500" />
        Informations TPE
      </h3>
      <div className="grid grid-cols-2 gap-4 ">
  {/* Marque */}
<Select
  value={interventionData.tpeBrand}
  onValueChange={(value) => {
    setInterventionData(prev => ({
      ...prev,
      tpeBrand: value,
      terminal_type_id: null // Reset terminal_type_id when brand changes
    }));
  }}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Sélectionnez une marque" />
  </SelectTrigger>
  <SelectContent>
    {[...new Set(tpes.map((t) => t.manufacturer))].map((brand) => (
      <SelectItem key={brand} value={brand}>
        {brand}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{/* Modèle */}
<Select
  value={interventionData.terminal_type_id?.toString() || ""}
  onValueChange={(value) => {
    const selectedId = parseInt(value);
    setInterventionData(prev => ({
      ...prev,
      terminal_type_id: selectedId
    }));
  }}
  disabled={!interventionData.tpeBrand}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Sélectionnez un modèle" />
  </SelectTrigger>
  <SelectContent>
    {tpes
      .filter((t) => t.manufacturer === interventionData.tpeBrand)
      .map((t) => (
        <SelectItem key={t.id} value={t.id.toString()}>
          {t.model}
        </SelectItem>
      ))}  
  </SelectContent>
</Select>
</div>

        
       
      </div>
    </div>

)}

          {activeTab === 'consumable' && (
  <div className="space-y-6">


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
                  {loadingConsumables ? (
                    <div className="h-10 bg-gray-200 rounded animate-pulse flex items-center justify-center">
                      <span className="text-sm text-gray-500">Chargement des types...</span>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(value) => handleConsumableItemChange(index, 'type', value)}
                      value={item.type}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {consumableTypes.map((consumableType) => (
                          <SelectItem key={consumableType.id} value={consumableType.type}>
                            {consumableType.type} - Stock: {consumableType.quantity}
                          </SelectItem>
                        ))}
                        <SelectItem value="AUTRE">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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
                      onChange={(e) => handleConsumableItemChange(index, 'quantity', e.target.value)}
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

                {item.type === 'AUTRE' && (
                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-sm font-medium mb-2">Précisez le type :</label>
                    <Input
                      type="text"
                      placeholder="Spécifiez le type de consommable"
                      value={item.customType || ''}
                      onChange={(e) => handleConsumableItemChange(index, 'customType', e.target.value)}
                      className="w-full"
                    />
                    {errors[`item-${index}-customType`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item-${index}-customType`]}</p>
                    )}
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
                item.type === 'AUTRE' ? item.customType : item.type
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