"use client"
import { DataTable } from "../data-table"
import { useEffect, useState } from "react"
import { fetchTPES_Manager } from "@/app/api/tickets"
import { format } from "date-fns"
import { filter_Tickets_manager } from "@/constants/tickets/filter_Tickets_manager"
import CreateTicketButton from "../../modal/intervention/Nouvelle_ticket"
import { TPEColumns } from "./columns"

export default function TPESTable() {
  const [tpes, setTpes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const entofr_status = (STATUS: string): string => {
    const map: Record<string, string> = {
      "PENDING": "EN ATTENTE",
      "UNDER_MAINTENANCE": "EN MAINTENANCE",
      "AT_SATEM": "AU SATEM",
      "IN_USE": "EN UTILISATION",
    }
    return map[STATUS] || STATUS
  }

  useEffect(() => {
    fetchTPES_Manager()
      .then((res) => {
        const transformed = res.data.map((tpe: any) => ({
          id: tpe?.tpeId ?? "",
          serialNumber: tpe?.serialNumber ?? "N/A",
          type: tpe?.type ?? "POS",
          model: tpe?.model ?? "-",
          manufacturer: tpe?.manufacturer ?? "-",
          telecomOperator: tpe?.telecomOperator ?? "-",
          label: tpe?.label ?? "-",
          status: entofr_status(tpe?.status ?? "-"),
          bankId: tpe?.bankId ?? "-",
          clientId: tpe?.currentClientId ?? "-",
          purchaseDate: tpe?.purchaseDate
            ? format(new Date(tpe.purchaseDate), "dd/MM/yyyy")
            : "",
          warrantyExpiry: tpe?.warrantyExpiry
            ? format(new Date(tpe.warrantyExpiry), "dd/MM/yyyy")
            : "",
          createdAt: tpe?.createdAt
            ? format(new Date(tpe.createdAt), "dd/MM/yyyy HH:mm")
            : "",
          updatedAt: tpe?.updatedAt
            ? format(new Date(tpe.updatedAt), "dd/MM/yyyy HH:mm")
            : "",
        }))

        // Sort by updatedAt (latest first)
        const sorted = transformed.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt.split(" ")[0].split("/").reverse().join("-")) : new Date(0)
          const dateB = b.updatedAt ? new Date(b.updatedAt.split(" ")[0].split("/").reverse().join("-")) : new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        setTpes(sorted)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des TPEs:", err)
        setError(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau des TPEs</h1>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur lors du chargement des TPEs.</div>
      ) : (
        <DataTable
          columns={TPEColumns} // ⚠️ you may need a new `TPEColumns` instead of `TicketColumns`
          data={tpes}
          filters={filter_Tickets_manager}
        />
      )}
    </div>
  )
}
