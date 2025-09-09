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
import { createInterventionTicket, createNetworkCheckTicket } from "@/app/api/tickets"


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
  tpes: {
    brand: string;
    model: string;
    quantity: string;
  }[];
}

type InterventionData = {
  problemCategory: string;
  problemType: string;
  tpeBrand: string;
  tpeModel: string;
  tpeSn: string;
}

type ConsumableData = {
  items: {
    type: string;
    quantity: string;
    customType?: string;
  }[];
}

export default function CreateTicketButton({ onCreate }: { onCreate?: () => void }) {
  const [agencies, setAgencies] = useState<any[]>([])
  const [gabs, setGabs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'network' | 'unblocking' | 'intervention' | 'consumable'>('network');

  const [agency, setAgency] = useState('')
  const [gab, setGab] = useState('')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [brand, setBrand] = useState('')



  const [unblockingData, setUnblockingData] = useState<UnblockingData>({
    blockedReason: '',
    previousAttempts: '',
    requiredAction: '',
    tpes: []
  });

 const [interventionData, setInterventionData] = useState<InterventionData>({
          problemCategory: '',
          problemType: '',
          tpeBrand: '',
          tpeModel: '',
          tpeSn: ''
});

const [consumableData, setConsumableData] = useState<ConsumableData>({
  items: [],
});

const handleAddConsumable = () => {
  setConsumableData(prev => ({
    ...prev,
    items: [...prev.items, { type: '', quantity: '1' }]
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
        const currentQty = parseInt(item.quantity || '0');
        const newQty = Math.max(1, currentQty + change);
        return { ...item, quantity: newQty.toString() };
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

  const [wilaya, setWilaya] = useState("");
  const [daira, setDaira] = useState("");


  const handleAddTpe = () => {
    setUnblockingData(prev => ({
      ...prev,
      tpes: [...prev.tpes, { brand: '', model: '', quantity: '1' }]
    }));
  };

  const handleRemoveTpe = (index: number) => {
    setUnblockingData(prev => ({
      ...prev,
      tpes: prev.tpes.filter((_, i) => i !== index)
    }));
  };

  const handleTpeChange = (index: number, field: string, value: string) => {
    setUnblockingData(prev => ({
      ...prev,
      tpes: prev.tpes.map((tpe, i) =>
        i === index ? { ...tpe, [field]: value } : tpe
      )
    }));
  };


  


  // Handle photo preview
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPhoto(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }, [])

  const clearPhoto = () => {
    setPhoto(null)
    setPreview(null)
  }


 // Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!phone) {
    newErrors.phone = "Le numéro de téléphone est obligatoire."
  } else if (!/^\+?\d{8,15}$/.test(phone)) {
    newErrors.phone = "Numéro de téléphone invalide."
  }
  if (!description) newErrors.description = "La description est obligatoire."
  if (!wilaya) newErrors.wilaya = "La wilaya est obligatoire."
  if (!daira) newErrors.daira = "La daira est obligatoire."

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Reset form state
const resetForm = () => {
  setPhone('')
  setDescription('')
  setWilaya('')
  setDaira('')
  setAddress('')
  setUnblockingData({
    blockedReason: '',
    previousAttempts: '',
    requiredAction: '',
    tpes: []
  })
  setInterventionData({
    problemCategory: '',
    problemType: '',
    tpeBrand: '',
    tpeModel: '',
    tpeSn: ''
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
  if (!validateForm()) return false
 

  const payload = {
    client_commercialName: clientName,              // Nom du client
    client_phoneNumber: phone,                      // Téléphone
    client_brand: brand,                               // Nom de l’enseigne (not implemented)
    client_wilaya: wilaya,
    client_daira: daira,
    client_address: address,
    notes: description,
  }

  try {
if (activeTab === 'network') {
    await createNetworkCheckTicket(payload)
}
else if (activeTab === "intervention") {
      await createInterventionTicket({
        ...payload,
        tpe_model: interventionData.tpeModel,
        tpe_serialNumber: interventionData.tpeSn,
        problem_description: interventionData.problemCategory + " - " + interventionData.problemType
      }); // ✅ now handled
    }
    resetForm()
    setSuccessMessage("✅ Ticket créé avec succès !")
    return false
  } catch (error) {
    console.error(error)
    alert("Erreur lors de la création du ticket.")
    return false
  }
}


 
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
    { id: 'network', label: 'Vérification Réseau', icon: <FaNetworkWired /> },
    { id: 'unblocking', label: 'Déblocage', icon: <FaUnlock /> },
    { id: 'intervention', label: 'Intervention', icon: <FaTools /> },
    { id: 'consumable', label: 'Consommable', icon: <FaBoxOpen /> },
  ]

  return (
    <DynamicModal
      triggerLabel="Nouveau ticket"
      title="Nouveau ticket"
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
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Common Fields */}
          {activeTab !== 'unblocking' && (
            <>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4  rounded-lg">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Nom du client :</label>
                  <Input
                    type="text"
                    placeholder="Mohamed Amine"
                    className="w-full"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
             

                {/* Téléphone */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Téléphone :</label>
<Input
  type="text"
  placeholder="+213650000000"
  className="w-full"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
                </div>
                {/* Nom de l'enseigne */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Nom de l'enseigne :</label>
                  <Input
                    type="text"
                    placeholder="Magasin Central"
                    className="w-full"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
        



                {/* Wilaya */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Wilaya :</label>
                  <Select
                    value={wilaya}
                    onValueChange={(value) => {
                      setWilaya(value);
                      setDaira(""); // reset daira
                    }}
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
                </div>

                {/* Daira */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Daira :</label>
                  <Select
                    value={daira}
                    onValueChange={setDaira}
                    disabled={!wilaya}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Sélectionnez une daira --" />
                    </SelectTrigger>
                    <SelectContent>
                      {wilaya &&
                        wilayas[wilaya].map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Adresse */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-2">Adresse :</label>
<Input
  type="text"
  placeholder="Adresse"
  className="w-full"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>
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
                <div className="border-t  pt-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Gestion des TPE</h3>
                    <Button
                      type="button"
                      onClick={() => handleAddTpe()}
                      className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2"
                    >
                      <FaPlus className="text-sm " />
                      Ajouter un TPE
                    </Button>
                  </div>

                  {unblockingData.tpes && unblockingData.tpes.length > 0 ? (
                    <div className="space-y-4">
                      {unblockingData.tpes.map((tpe, index) => (
                        <div key={index} className="p-4 border rounded-lg  relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveTpe(index)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                          >
                            <FaTrash className="text-sm" />
                          </button>

                          <h4 className="font-medium mb-3">TPE #{index + 1}</h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-medium mb-2">Marque :</label>
                              <Select
                                onValueChange={(value) => handleTpeChange(index, 'brand', value)}
                                value={tpe.brand}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez une marque" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="INGENICO">INGENICO</SelectItem>
                                  <SelectItem value="PAX">PAX</SelectItem>
                                  <SelectItem value="VERIFONE">VERIFONE</SelectItem>
                                  <SelectItem value="NEWPOS">NEWPOS</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex flex-col">
                              <label className="text-sm font-medium mb-2">Modèle :</label>
                              <Select
                                onValueChange={(value) => handleTpeChange(index, 'model', value)}
                                value={tpe.model}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez un modèle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {!tpe.brand && (
                                    <SelectItem key="no-brand" value="no-brand" disabled>
                                      Sélectionnez d'abord une marque
                                    </SelectItem>
                                  )}
                                  {tpe.brand === "INGENICO" && (
                                    <>
                                      <SelectItem key="iCT250" value="iCT250">iCT250</SelectItem>
                                      <SelectItem key="iWL250" value="iWL250">iWL250</SelectItem>
                                      <SelectItem key="iSC250" value="iSC250">iSC250</SelectItem>
                                      <SelectItem key="iPP320" value="iPP320">iPP320</SelectItem>
                                    </>
                                  )}
                                  {tpe.brand === "PAX" && (
                                    <>
                                      <SelectItem key="A920" value="A920">A920</SelectItem>
                                      <SelectItem key="A920Pro" value="A920Pro">A920 Pro</SelectItem>
                                      <SelectItem key="A800" value="A800">A800</SelectItem>
                                      <SelectItem key="S300" value="S300">S300</SelectItem>
                                    </>
                                  )}
                                  {tpe.brand === "VERIFONE" && (
                                    <>
                                      <SelectItem key="VX520" value="VX520">VX520</SelectItem>
                                      <SelectItem key="VX680" value="VX680">VX680</SelectItem>
                                      <SelectItem key="VX820" value="VX820">VX820</SelectItem>
                                      <SelectItem key="e355" value="e355">e355</SelectItem>
                                    </>
                                  )}
                                  {tpe.brand === "NEWPOS" && (
                                    <>
                                      <SelectItem key="N86" value="N86">N86</SelectItem>
                                      <SelectItem key="N5" value="N5">N5</SelectItem>
                                      <SelectItem key="N910" value="N910">N910</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex flex-col">
                              <label className="text-sm font-medium mb-2">Quantité :</label>
                              <Input
                                type="number"
                                min="1"
                                placeholder="1"
                                value={tpe.quantity}
                                onChange={(e) => handleTpeChange(index, 'quantity', e.target.value)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg ">
                      <FaInfoCircle className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-gray-500">Aucun TPE ajouté. Cliquez sur "Ajouter un TPE" pour commencer.</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Marque :</label>
          <Select 
            onValueChange={(value) => handleInterventionDataChange('tpeBrand', value)} 
            value={interventionData.tpeBrand}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une marque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INGENICO">INGENICO</SelectItem>
              <SelectItem value="PAX">PAX</SelectItem>
              <SelectItem value="VERIFONE">VERIFONE</SelectItem>
              <SelectItem value="NEWPOS">NEWPOS</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Modèle :</label>
          <Select 
            onValueChange={(value) => handleInterventionDataChange('tpeModel', value)} 
            value={interventionData.tpeModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              {interventionData.tpeBrand === "INGENICO" && (
                <>
                  <SelectItem value="iCT250">iCT250</SelectItem>
                  <SelectItem value="iWL250">iWL250</SelectItem>
                  <SelectItem value="iSC250">iSC250</SelectItem>
                  <SelectItem value="iPP320">iPP320</SelectItem>
                </>
              )}
              {interventionData.tpeBrand === "PAX" && (
                <>
                  <SelectItem value="A920">A920</SelectItem>
                  <SelectItem value="A920Pro">A920 Pro</SelectItem>
                  <SelectItem value="A800">A800</SelectItem>
                  <SelectItem value="S300">S300</SelectItem>
                </>
              )}
              {interventionData.tpeBrand === "VERIFONE" && (
                <>
                  <SelectItem value="VX520">VX520</SelectItem>
                  <SelectItem value="VX680">VX680</SelectItem>
                  <SelectItem value="VX820">VX820</SelectItem>
                  <SelectItem value="e355">e355</SelectItem>
                </>
              )}
              {interventionData.tpeBrand === "NEWPOS" && (
                <>
                  <SelectItem value="N86">N86</SelectItem>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N910">N910</SelectItem>
                </>
              )}
              {interventionData.tpeBrand === "OTHER" && (
                <SelectItem value="OTHER">Autre modèle</SelectItem>
              )}
             {!interventionData.tpeBrand && (
  <SelectItem value="no-brand" disabled>
    Sélectionnez d'abord une marque
  </SelectItem>
)}

            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Numéro de série :</label>
          <Input
            type="text"
            placeholder="SN000000"
            value={interventionData.tpeSn}
            onChange={(e) => handleInterventionDataChange('tpeSn', e.target.value)}
            className="w-full"
          />
        </div>
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
                  <Select
                    onValueChange={(value) => handleConsumableItemChange(index, 'type', value)}
                    value={item.type}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toner">Toner</SelectItem>
                      <SelectItem value="paper">Papier</SelectItem>
                      <SelectItem value="ribbon">Ruban</SelectItem>
                      <SelectItem value="cartridge">Cartouche</SelectItem>
                      <SelectItem value="cleaning_kit">Kit de nettoyage</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
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
              {consumableData.items.reduce((total, item) => total + parseInt(item.quantity || '0'), 0)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Types demandés :</p>
            <p className="text-sm text-blue-900">
              {Array.from(new Set(consumableData.items.map(item => 
                item.type === 'other' ? item.customType : item.type
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