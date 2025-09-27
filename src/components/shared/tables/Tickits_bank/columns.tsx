// columns.tsx
"use client"; // 👈 ADD THIS LINE

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Ticket } from "@/types/ticket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TicketDetailsButton } from "../../modal/interventionBank/tickitsdetailsButton";

// Columns for tickets (TickitColumns)
export const createTickitColumns = (onRefresh: () => void): ColumnDef<Ticket>[] => [
  {
    accessorKey: "id",
    header: "N° ticket",
    cell: ({ row }) => <span>{row.original.id}</span>,
  },

   {
    accessorKey: "date",
    header: "DATE",
    cell: ({ row }) => <span>{row.original.requestDate}</span>,
  },

   {
    accessorKey: "bankname",
    header: "BANQUE",
    cell: ({ row }) => <span>{row.original.bank?.name}</span>,
  },

  {
    accessorKey: "type",
    header: "TYPE DE DEMANDE",
    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-600">{row.original.type}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUT",
    cell: ({ row }) => {
      const status = row.original.status;
    const colorMap: Record<string, string> = {
  "CLOTURÉ": "text-green-600 text-2xl",
  "EN COURS": "text-orange-500",
  "EN ATTENTE": "text-blue-500",
  "DEMANDÉ": "text-gray-500",
  "ASSIGNÉ": "text-purple-500",
  "EN ATTENTE D'APPROBATION (MASQUÉ)": "text-yellow-500",
  "MASQUÉ": "text-gray-400",
  "PROBLÈME CLIENT": "text-red-500",
  "LIVRÉ": "text-green-500",
  "ANNULÉ": "text-red-600"
};
      return (
        <div className="flex items-center gap-2">
          <span className={`text-3xl flex items-center leading-none ${colorMap[status]}`}>•</span>
          <span>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sn",
    header: "SN",
        cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-600">{row.original.tpe.serialNumber}</Badge>
    ),
  },
  {
    accessorKey: "model",
    header: "MODÈLE",

         cell: ({ row }) => (
          <div className="flex flex-col ">
            <h1 className="font-semibold" >{row.original.tpe.brand}</h1>
            <h1 >{row.original.tpe.model}</h1>
          </div>
    ),

  },
  {
    accessorKey: "client",
    header: "CLIENT",
    cell: ({ row }) => (
          row.original.client.name !== '-' ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{row.original.client.name[0]}</AvatarFallback>
              </Avatar>
              <span>{row.original.client.name}</span>
            </div>
          ) : null
        ),
  },

   {
  header: 'Actions',
  cell: ({ row }) => (
    <TicketDetailsButton
      ticket={row.original}
      onSave={(updatedTicket) => {
        // Implement your save logic here, e.g., update state or make an API call
        console.log("Ticket saved:", updatedTicket);
        onRefresh(); // Refresh the table after saving
      }}
      onClose={onRefresh} // Refresh the table after closing ticket
    />
  )
}

];

// Export the original columns for backward compatibility
export const TickitColumns = createTickitColumns(() => {});
