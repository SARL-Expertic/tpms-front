"use client";

import { useState, useEffect } from "react";
import { FaInfoCircle, FaUser, FaCreditCard, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { Ticket } from "@/types/ticket";
import { FaBoxesStacked } from "react-icons/fa6";
import { fetchBankEmployeeAttachments,downloadBankEmployeeAttachment } from "@/app/api/tickets";
import { Paperclip, FileText, Download as DownloadIcon } from "lucide-react";

type Props = {
  ticket: Ticket;
};

const statusColorMap: Record<string, string> = {
   "CLOTURÉ": "bg-green-600 text-2xl",
    "EN COURS": "bg-orange-500",
     "EN ATTENTE": "bg-blue-500",
};

export function TicketDetailsButton({ ticket }: Props) {
  const { id, type, status, note, tpe, client, deblockingOrder, requestDate, completedDate, intervention , consumableRequest } = ticket;
  
  // Attachment states
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch attachments when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadAttachments();
    }
  }, [isModalOpen]);

  // Fetch attachments for the ticket
  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const response = await fetchBankEmployeeAttachments(parseInt(id));
      setAttachments(response.data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // Download an attachment
  const handleDownloadAttachment = async (attachmentId: number, filename: string) => {
    try {
      const response = await downloadBankEmployeeAttachment(parseInt(id), attachmentId);
      
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
    }
  };

  return (
    <DynamicModal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
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

            <Badge className={`flex items-center ${statusColorMap[status]} gap-2 px-3 py-2 text-sm`}>
              <span className={`h-2 w-2 rounded-full   bg-white `} />
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

        <div className={`grid  ${type === "INTERVENTION" || type === "CONSOMMABLE" ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6`}>
          {/* Client Information */}
        {type !=='DÉBLOCAGE' && 
          <div className={`space-y-3 ${type === "INTERVENTION" || type === "CONSOMMABLE" ? "col-span-1" : "col-span-2"} bg-white dark:bg-gray-800 p-4 rounded-lg border`}>
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
}

{type === "CONSOMMABLE"  &&
  <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
    <h3 className="font-semibold text-foreground flex items-center gap-2">
      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
        <FaBoxesStacked className="text-green-600 dark:text-green-400" />
      </div>
      Consommables
    </h3>
  {(!consumableRequest || consumableRequest.items.length === 0) ? (
    <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">Aucun consommable demandé</p>
  ) : (
    <div className="ml-12">
      <div className="grid gap-4 text-sm">
        {consumableRequest.items.map((item, index) => (
          <div key={index} className="mb-2">
            <div>
              <span className="text-muted-foreground">Type:</span> {item.type}
            </div>
            <div>
              <span className="text-muted-foreground">Quantité:</span> {item.quantity}
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

    </div>
        

  }

          {/* TPE Information for CONSOMMABLE */}
          {type === "CONSOMMABLE" && tpe &&
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
          }


          {/* TPE Information */}
          {type !=='CHOIX DE RÉSEAU' && type !=='CONSOMMABLE' &&
          <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <FaCreditCard className="text-orange-600 dark:text-orange-400" />
              </div>
              TPE
            </h3>
          {(type ==='CHOIX DE RÉSEAU' || type ==='INTERVENTION') && (
            <>
              <div className="grid gap-2 text-sm ml-12">
                <div><span className="text-muted-foreground">SN:</span> {tpe.serialNumber}</div>
                <div><span className="text-muted-foreground">Modèle:</span> {tpe.model}</div>
                <div><span className="text-muted-foreground">Marque:</span> {tpe.brand}</div>
              </div>
              {type ==='INTERVENTION' && intervention?.problem && (
                <div className="grid gap-2 text-sm ml-12">
                  <div><span className="text-muted-foreground">Problème:</span> {intervention.problem}</div>
                </div>
              )}
            </>
          )}
            {type ==='DÉBLOCAGE' && tpe && (
            <div className="grid gap-2 text-sm ml-12">
              <div><span className="text-muted-foreground">SN:</span> {tpe.serialNumber}</div>
              <div><span className="text-muted-foreground">Modèle:</span> {tpe.model}</div>
              <div><span className="text-muted-foreground">Marque:</span> {tpe.brand}</div>
            </div>
            )}
          </div>
    }
    
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
                <p className="text-sm text-muted-foreground">Fichiers disponibles:</p>
                <div className="grid gap-2">
                  {attachments.map((attachment: any) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                        <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium truncate" title={attachment.filename || attachment.name || 'Fichier sans nom'}>
                            {attachment.filename || attachment.name || 'Fichier sans nom'}
                          </p>
                          {attachment.size && (
                            <p className="text-xs text-muted-foreground">
                              {(attachment.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.filename || attachment.name || 'download')}
                          className="flex items-center gap-2 hover:bg-indigo-100"
                        >
                          <DownloadIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Télécharger</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !loadingAttachments && (
                <p className="text-sm text-muted-foreground">Aucune pièce jointe</p>
              )
            )}
          </div>
        </div>
      </div>
    </DynamicModal>
  );
}