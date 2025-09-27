"use client"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { fetchTickets, fetchTickets_Manager } from "@/app/api/tickets"
import { format } from "date-fns"
import { filter_Tickets_manager } from "@/constants/tickets/filter_Tickets_manager"
import { createTickitColumns } from "./columns"
import CreateTicketButton from "../../modal/interventionBank/Nouvelle_ticket"
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton"
import { MagicalSpinner } from "@/components/magic-loaders/magical-spinner"
import { TableSkeleton } from "@/components/magic-loaders/table-skeleton"

export default function TickitsTable() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      "DELIVERED": "LIVRÉ", 
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
          model: ticket?.tpe?.model ?? '-',
          brand: ticket?.tpe?.manufacturer ?? '-',
          bankname: ticket?.bank?.name ?? '-',
          bank: ticket?.bank ? {
            id: ticket?.bank?.id ?? 0,
            name: ticket?.bank?.name ?? '-',
          } : undefined,
          tpe: {
            tpetype: ticket?.tpe?.terminalType?.id ?? '-',
            serialNumber: ticket?.tpe?.serialNumber ?? 'N/A',
            brand: ticket?.tpe?.terminalType?.manufacturer?.name ?? '-',
            id_brand: ticket?.tpe?.terminalType?.manufacturer?.id ?? '',
            model: ticket?.tpe?.terminalType?.model?.name ?? '-',
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
        const sorted = transformed.sort((a, b) => {
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

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
          bg-clip-text text-transparent">
          Tableau des demandes
        </h1>
        <CreateTicketButton onCreate={fetchAndSetTickets} />
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
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 
              text-white rounded-lg hover:from-purple-600 hover:to-blue-600 
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
    </div>
  )
}