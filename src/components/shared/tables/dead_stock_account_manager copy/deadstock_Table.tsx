"use client"
import { DataTable } from "../data-table"
import { useEffect, useState, useRef } from "react"
import { fetchTickets, fetchTickets_Manager, downloadExcelTemplate, uploadExcelFile } from "@/app/api/tickets"
import { format } from "date-fns"
import { filter_Tickets_manager } from "@/constants/tickets/filter_Tickets_manager"
import { createTickitColumns } from "./columns"
import CreateTicketButton from "../../modal/interventionBank/Nouvelle_ticket"
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton"
import { MagicalSpinner } from "@/components/magic-loaders/magical-spinner"
import { TableSkeleton } from "@/components/magic-loaders/table-skeleton"
import { Button } from "@/components/ui/button"
import { Download, Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TickitsTable() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  const entofr_Type = (TYPE: string): string => {
    const map: Record<string, string> = {
      "NETWORK_CHECK": "CHOIX DE RÉSEAU",
      "CONSUMABLE": "CONSOMMABLE",
      "INTERVENTION": "INTERVENTION",
      "INSTALLATION": "INSTALLATION",
      "REPLACEMENT": "REMPLACEMENT",
      "DEBLOCKING_ORDER": "DÉBLOCAGE",
    };
    return map[TYPE] || TYPE;
  }

  

  const entofr_status = (STATUS: string): string => {
    const map: Record<string, string> = {
      "REQUESTED": "DEMANDÉ",
      "ASSIGNED": "ASSIGNÉ",
      "PENDING": "EN ATTENTE", 
      "COMPLETED": "CLOTURÉ",
      "CLIENT_PROBLEM": "PROBLÈME CLIENT",
      "DELIVERED": "LIVRÉ SATIM", 
      "CANCELLED": "ANNULÉ",
      "HIDDEN_PENDING_APPROVAL": "EN ATTENTE D'APPROBATION (MASQUÉ)",
      "HIDDEN": "MASQUÉ",
      "IN_PROGRESS": "EN COURS"
    };
    return map[STATUS] || STATUS;
  };

  // Function to fetch and refresh tickets
  const fetchAndSetTickets = () => {
    setLoading(true)
    fetchTickets_Manager()
      .then((res) => {
        const transformed = res.data.map((ticket: any) => ({
          id: ticket?.id ?? '',
          type: entofr_Type(ticket?.type ?? ''),
          status: entofr_status(ticket?.status ?? ''),
          note: ticket?.notes ?? '',
          model: ticket?.terminalType?.model?.name ?? '-',
          brand: ticket?.terminalType?.manufacturer?.name ?? '-',
          bankname: ticket?.bank?.name ?? '-',
          bank: ticket?.bank ? {
            id: ticket?.bank?.id ?? 0,
            name: ticket?.bank?.name ?? '-',
          } : undefined,
          tpe: {
            tpetype: ticket?.tpe?.terminalType?.id ?? '-',
            serialNumber: ticket?.tpe?.serialNumber ?? '',
            brand: ticket?.terminalType?.manufacturer?.name ?? '-',
            id_brand: ticket?.terminalType?.manufacturer?.id ?? '',
            model: ticket?.terminalType?.model?.name ?? '-',
            id_model: ticket?.tpe?.terminalType?.model?.id ?? '',          
          },
          deblockingOrder: ticket?.deblockingOrder ? {
            id: ticket?.deblockingOrder?.id ?? '',
            type: ticket?.deblockingOrder?.type ?? '',
            items: ticket?.deblockingOrder?.items ?? [],
          } : undefined,
          problemDescription: ticket?.problemDescription ?? 'N/A',
          intervention: ticket?.intervention ?{
            problem: ticket?.intervention?.problem ?? '-',
          } : undefined,
          client: {
            id: ticket?.client?.id ?? '',
            name: ticket?.client?.commercialName ?? '-',
            brand: ticket?.client?.brand ?? '-',
            phoneNumber: ticket?.client?.phoneNumber ?? '-',
            mobileNumber: ticket?.client?.mobileNumber ?? '-',
            location: {
              wilaya: ticket?.client?.location?.wilaya ?? 'N/A',
              daira: ticket?.client?.location?.daira ?? 'N/A',
              address: ticket?.client?.location?.address ?? 'N/A',
            },
          },
          consumableRequest: ticket?.consumableRequest ? {
            items: ticket?.consumableRequest?.items ?? [],
          } : undefined,
          requestDate: ticket?.requestDate
            ? format(new Date(ticket.requestDate), "dd/MM/yyyy HH:mm")
            : "",
          completedDate: ticket?.completedDate
            ? format(new Date(ticket.completedDate), "dd/MM/yyyy HH:mm")
            : "",          
        }))
        // Sort by requestDate descending (newest first)
        const sorted = transformed.sort((a: any, b: any) => {
          const dateA = a.requestDate ? new Date(a.requestDate.split(' ')[0].split('/').reverse().join('-') + 'T' + a.requestDate.split(' ')[1]) : new Date(0);
          const dateB = b.requestDate ? new Date(b.requestDate.split(' ')[0].split('/').reverse().join('-') + 'T' + b.requestDate.split(' ')[1]) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setTickets(sorted)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des tickets:', err);
        setError(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAndSetTickets()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setModalType(type)
    setModalMessage(message)
    setShowModal(true)
  }

  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true)
      const response = await downloadExcelTemplate()
      
      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `template_tickets_${format(new Date(), 'dd-MM-yyyy')}.xlsx`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showNotification('success', 'Template téléchargé avec succès!')
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error)
      showNotification('error', 'Erreur lors du téléchargement du template Excel')
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadLoading(true)
      await uploadExcelFile(file)
      
      // Refresh tickets after successful upload
      await fetchAndSetTickets()
      
      showNotification('success', 'Fichier importé avec succès! Les tickets ont été créés.')
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'import du fichier:', error)
      const errorMessage = error?.response?.data?.message || 'Erreur lors de l\'import du fichier Excel'
      showNotification('error', errorMessage)
    } finally {
      setUploadLoading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
          bg-clip-text text-transparent">
          Tableau des demandes
        </h1>
        <div className="flex gap-3 items-center">
          <Button
            onClick={handleDownloadTemplate}
            disabled={downloadLoading}
            variant="outline"
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
          >
            {downloadLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Télécharger Template
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            onClick={triggerFileInput}
            disabled={uploadLoading}
            variant="outline"
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
          >
            {uploadLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Importer Excel
          </Button>
          
          <CreateTicketButton onCreate={fetchAndSetTickets} />
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          {/* Choose one of these loading components: */}
          {/* <TableSkeleton /> */}
          {/* or */}
          {/* <MagicalSpinner /> */}
          {/* or */}
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">Erreur lors du chargement des tickets.</div>
          <button 
            onClick={fetchAndSetTickets}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-500 
              text-white rounded-lg hover:from-blue-800 hover:to-blue-600 
              transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <DataTable
          columns={createTickitColumns(fetchAndSetTickets)}
          data={tickets}
          filters={filter_Tickets_manager}
        />
      )}

      {/* Notification Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {modalType === 'success' ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-green-700">Succès</span>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-red-700">Erreur</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-4 text-base">
              {modalMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setShowModal(false)}
              className={modalType === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}