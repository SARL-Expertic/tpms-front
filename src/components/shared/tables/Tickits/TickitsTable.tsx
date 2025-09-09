
"use client"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { fetchTickets } from "@/app/api/tickets"
import { format } from "date-fns"
import { filter_Tickets } from "@/constants/tickets/filter_Tickets"
import { TickitColumns } from "./columns"
import CreateTicketButton from "../../modal/intervention/Nouvelle_ticket"

export default function TickitsTable() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const entofr_Type = (TYPE: string): string => {
    const map: Record<string, string> = {
      "NETWORK_CHECK": "VÉRIFICATION RÉSEAU",
      "CONSUMABLE": "CONSOMMABLE",
      "INTERVENTION": "INTERVENTION",
      "INSTALLATION": "INSTALLATION",
      "REPLACEMENT": "REMPLACEMENT",
    };
    return map[TYPE] || TYPE;
  }


  const entofr_status = (STATUS: string): string => {
    const map: Record<string, string> = {
      "COMPLETED": "CLOTURÉ",
      "IN_PROGRESS": "EN COURS",
      "PENDING": "EN ATTENTE",
    };
    return map[STATUS] || STATUS;
  }

  useEffect(() => {
    fetchTickets()
      .then((res) => {
        const transformed = res.data.map((ticket: any) => ({
          id: ticket.id,
          type: entofr_Type(ticket.type),
          status: entofr_status(ticket.status),
          note: ticket.notes,
          model: ticket.tpe?.model ?? "non",
          brand: ticket.tpe?.manufacturer ?? "brand",
          tpe: {
            serialNumber: ticket.tpe?.serialNumber ?? "N/A",
            model: ticket.tpe?.model ?? "non",
            brand: ticket.tpe?.manufacturer ?? "brand",
          },

          client: {
            id: ticket.client.id,
            name: ticket.client.commercialName,
            brand: ticket.client.brand,
            phoneNumber: ticket.client.phoneNumber,
            mobileNumber: ticket.client.mobileNumber || '-',
            
            location: {
              wilaya: ticket.client.location?.wilaya || 'N/A',
              daira: ticket.client.location?.daira || 'N/A',
              address: ticket.client.location?.address || 'N/A',
            },

          },
          requestDate: ticket.requestDate ? format(new Date(ticket.requestDate), "dd/MM/yyyy HH:mm") : "",
          completedDate: ticket.completedDate ? format(new Date(ticket.completedDate), "dd/MM/yyyy HH:mm") : "",
        }))
        setTickets(transformed)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des tickets:', err);
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des tickets</h1>
    <CreateTicketButton />
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur lors du chargement des tickets.</div>
      ) : (

        <DataTable
          columns={TickitColumns}
          data={tickets}
          filters={filter_Tickets}
        />
      )}
    </div>
  )

}