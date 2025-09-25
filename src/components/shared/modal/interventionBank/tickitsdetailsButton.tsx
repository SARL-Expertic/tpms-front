"use client";

import { useState } from "react";
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
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
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
import { closeticket } from "@/app/api/tickets";

type Props = {
  ticket: Ticket;
  onSave: (updatedTicket: Ticket) => void;
};

const statusColorMap: Record<string, string> = {
  CLOTURÉ: "bg-green-600 text-2xl",
  "EN COURS": "bg-orange-500",
  "EN ATTENTE": "bg-blue-500",
  DEMANDÉ: "bg-gray-500",
  ASSIGNÉ: "bg-purple-500",
  "EN ATTENTE D'APPROBATION (MASQUÉ)": "bg-yellow-500",
  MASQUÉ: "bg-gray-400",
  "PROBLÈME CLIENT": "bg-red-500",
  LIVRÉ: "bg-green-500",
  ANNULÉ: "bg-red-600",
};

const statusOptions = ["CLOTURÉ", "EN COURS", "EN ATTENTE"];

export function TicketDetailsButton({ ticket, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState<Ticket>({ ...ticket });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Function to handle the GET request
  const handleGetRequest = async () => {
    setIsLoading(true);
    setSuccessMessage(''); // Clear any previous message
    try {
      // Example GET request with ticketId as query parameter
      const response: any = await closeticket(parseInt(id));

      if (response.status !== "success") {
        throw new Error("Failed to Close ticket");
      }
      setSuccessMessage("Ticket fermé avec succès!");
    } catch (error) {
      console.error("Error making GET request:", error);
      setSuccessMessage("Erreur lors de la fermeture du ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave(editedTicket);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTicket({ ...ticket });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setEditedTicket((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setEditedTicket((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof Ticket],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (
    parent: string,
    index: number,
    field: string,
    value: any
  ) => {
    setEditedTicket((prev) => {
      const updatedArray = [...(prev[parent as keyof Ticket] as any[])];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value,
      };

      return {
        ...prev,
        [parent]: updatedArray,
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

  return (
    <DynamicModal
      footer_childern={
        <Button
          onClick={handleGetRequest}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-800 text-white cursor-pointer flex items-center gap-2"
        >
          <FaDownLeftAndUpRightToCenter className="text-sm" />
          {isLoading ? "Chargement..." : "Close Ticket"}
        </Button>
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
      title={
        <div className="flex items-center justify-between">
          <span>Détails du ticket</span>
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
                onClick={handleSave}
                size="sm"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <FaSave />
                Enregistrer
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FaTimes />
                Annuler
              </Button>
            </div>
          )}
        </div>
      }
      description={`Informations complètes du ticket #${id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-6 p-1">
        {/* Success/Error Message */}
        {successMessage && (
          <div className={`p-4 rounded-lg text-center font-medium ${
            successMessage.includes('succès') || successMessage.includes('Ticket fermé') 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {successMessage}
          </div>
        )}
        
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
                  {statusOptions.map((option) => (
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
                    {isEditing ? (
                      <Input
                        type="date"
                        value={requestDate}
                        onChange={(e) =>
                          handleChange("requestDate", e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : (
                      ` ${requestDate}`
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clôture:</span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={completedDate || ""}
                        onChange={(e) =>
                          handleChange("completedDate", e.target.value || null)
                        }
                        className="mt-1"
                      />
                    ) : (
                      ` ${completedDate || "—"}`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <FaBoxesStacked className="text-green-600 dark:text-green-400" />
                </div>
                Consommables
              </h3>
              {!consumableRequest || consumableRequest.items.length === 0 ? (
                <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">
                  Aucun consommable demandé
                </p>
              ) : (
                <div className="ml-12">
                  <div className="grid gap-4 text-sm">
                    {consumableRequest.items.map((item, index) => (
                      <div key={item.id} className="mb-2 p-2 border rounded">
                        {isEditing ? (
                          <>
                            <div className="mb-2">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <Input
                                value={item.type}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "consumableRequest.items",
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Quantité:
                              </span>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleArrayChange(
                                    "consumableRequest.items",
                                    index,
                                    "quantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-muted-foreground">
                                Type:
                              </span>{" "}
                              {item.type}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Quantité:
                              </span>{" "}
                              {item.quantity}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TPE Information */}
          {type !== "CHOIX DE RÉSEAU" && type !== "CONSOMMABLE" && (
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <FaCreditCard className="text-orange-600 dark:text-orange-400" />
                </div>
                TPE
              </h3>
              {(type === "CHOIX DE RÉSEAU" || type === "INTERVENTION") && (
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
                      <span className="text-muted-foreground">Modèle:</span>
                      {isEditing ? (
                        <Input
                          value={tpe.model}
                          onChange={(e) =>
                            handleNestedChange("tpe", "model", e.target.value)
                          }
                          className="mt-1"
                        />
                      ) : (
                        ` ${tpe.model}`
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Marque:</span>
                      {isEditing ? (
                        <Input
                          value={tpe.brand}
                          onChange={(e) =>
                            handleNestedChange("tpe", "brand", e.target.value)
                          }
                          className="mt-1"
                        />
                      ) : (
                        ` ${tpe.brand}`
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
              {type === "DÉBLOCAGE" && (
                <div className="grid grid-cols-2 gap-4 text-sm ml-12">
                  {deblockingOrder?.items.map((item, index) => (
                    <div key={item.id} className="mb-2 p-2 border rounded">
                      {isEditing ? (
                        <>
                          <div className="mb-2">
                            <span className="text-muted-foreground">
                              Marque:
                            </span>
                            <Input
                              value={item.clientTpe.manufacturer}
                              onChange={(e) =>
                                handleArrayChange(
                                  "deblockingOrder.items",
                                  index,
                                  "clientTpe",
                                  {
                                    ...item.clientTpe,
                                    manufacturer: e.target.value,
                                  }
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="mb-2">
                            <span className="text-muted-foreground">
                              Modèle:
                            </span>
                            <Input
                              value={item.clientTpe.model}
                              onChange={(e) =>
                                handleArrayChange(
                                  "deblockingOrder.items",
                                  index,
                                  "clientTpe",
                                  {
                                    ...item.clientTpe,
                                    model: e.target.value,
                                  }
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <span className="text-muted-foreground">SN:</span>
                            <Input
                              value={item.clientTpe.serialNumber}
                              onChange={(e) =>
                                handleArrayChange(
                                  "deblockingOrder.items",
                                  index,
                                  "clientTpe",
                                  {
                                    ...item.clientTpe,
                                    serialNumber: e.target.value,
                                  }
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-muted-foreground">
                              Marque:
                            </span>{" "}
                            {item.clientTpe.manufacturer}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Modèle:
                            </span>{" "}
                            {item.clientTpe.model}
                          </div>
                          <div>
                            <span className="text-muted-foreground">SN:</span>{" "}
                            {item.clientTpe.serialNumber}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
      </div>
    </DynamicModal>
  );
}
