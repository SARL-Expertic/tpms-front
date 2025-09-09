"use client";

import { FaInfoCircle, FaUser, FaCreditCard, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { Ticket } from "@/types/ticket";

type Props = {
  ticket: Ticket;
};

const statusColorMap: Record<string, string> = {
  "Clôturé": "bg-green-600",
  "Ouvert": "bg-blue-500",
  "En attente": "bg-yellow-500",
  "Annulé": "bg-red-600",
  "En cours": "bg-orange-500",
};

export function TicketDetailsButton({ ticket }: Props) {
  const { id, type, status, note, tpe, client, requestDate, completedDate } = ticket;

  return (
    <DynamicModal
      triggerLabel={
        <Button  size="sm" className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2">
          <FaInfoCircle className="text-lg" />
          Détails
        </Button>
      }
      title="Détails du ticket"
      description={`Informations complètes du ticket #${id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-6 p-1">
        {/* Ticket Header */}
        <div className=" dark:from-slate-800 dark:to-gray-900 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className=" p-2 rounded-lg">
                  #{id}
                </span>
                <span className="text-sm font-normal text-muted-foreground">N° ticket</span>
              </h2>
            </div>

            <Badge className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${statusColorMap[status] || "bg-gray-400"}`} />
              {status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-md">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FaCreditCard className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Type</h3>
                <p className="text-sm">{type}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-md">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <FaCalendarAlt className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Dates</h3>
                <div className="text-sm">
                  <div><span className="text-muted-foreground">Demande:</span> {requestDate}</div>
                  <div><span className="text-muted-foreground">Clôture:</span> {completedDate || "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <FaUser className="text-green-600 dark:text-green-400" />
              </div>
              Client
            </h3>
            <div className="grid gap-2 text-sm ml-12">
              <div><span className="text-muted-foreground">Nom du client :</span> {client.name}</div>
              <div><span className="text-muted-foreground">Nom de l'enseigne:</span> {client.brand}</div>
              <div><span className="text-muted-foreground">Téléphone:</span> {client.phoneNumber}</div>
              <div><span className="text-muted-foreground">Mobile:</span> {client.mobileNumber}</div>
<div>
  <span className="text-muted-foreground">Adresse:</span>{" "}
  {client.location?.wilaya || "N/A"}, {client.location?.daira || "N/A"}, {client.location?.address || "N/A"}
</div>
            </div>
          </div>

          {/* TPE Information */}
          <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <FaCreditCard className="text-orange-600 dark:text-orange-400" />
              </div>
              TPE
            </h3>
            <div className="grid gap-2 text-sm ml-12">
              <div><span className="text-muted-foreground">SN:</span> {tpe.serialNumber}</div>
              <div><span className="text-muted-foreground">Modèle:</span> {tpe.model}</div>
              <div><span className="text-muted-foreground">Marque:</span> {tpe.brand}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <FaStickyNote className="text-amber-600 dark:text-amber-400" />
            </div>
            Notes
          </h3>
          <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">{note || "Aucune note"}</p>
        </div>
      </div>
    </DynamicModal>
  );
}