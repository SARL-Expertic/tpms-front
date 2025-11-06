"use client"

import { useEffect, useState } from "react"
import { DataTable } from "../data-table"
import { createDeadStockColumns } from "./columns"
import { FETCH_DEAD_STOCK_CLIENT } from "@/app/api/tickets"
import { Button } from "@/components/ui/button"
import { FaBox } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton"
import { DeadStock } from "@/types/deadstock"
import { CheckCircle2, XCircle } from "lucide-react"
import { getConditionLabel } from "@/constants/deadstock/conditions"

// Filter configuration for dead stock table (no bank filter for clients - they are the bank)
const deadStockFilters = [
  {
    key: "name" as keyof DeadStock,
    label: "Nom",
    placeholder: "Rechercher par nom...",
  },
  {
    key: "condition" as keyof DeadStock,
    label: "Condition",
    placeholder: "Filtrer par condition...",
  },
];

export default function DeadStockTable() {
  const [deadStockItems, setDeadStockItems] = useState<DeadStock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  // Function to fetch and refresh dead stock items (for bank client)
  const fetchAndSetDeadStock = () => {
    setLoading(true)
    FETCH_DEAD_STOCK_CLIENT()
      .then((res) => {
        // API response has structure: { deadStock: [...], message: "..." }
        const items = res.data.deadStock || []
        // No need to map bankName since client IS the bank
        setDeadStockItems(items)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur lors du chargement des articles dead stock:', err)
        setError(err.message || 'Erreur inconnue')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAndSetDeadStock()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setModalType(type)
    setModalMessage(message)
    setShowModal(true)
  }

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
          bg-clip-text text-transparent flex items-center gap-2">
          <FaBox className="text-blue-600" />
          Dead Stock - Mon Inventaire
        </h1>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">Erreur lors du chargement des articles dead stock.</div>
          <button 
            onClick={fetchAndSetDeadStock}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-700 to-blue-500 
              text-white rounded-lg hover:from-blue-800 hover:to-blue-600 
              transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <DataTable
          columns={createDeadStockColumns(fetchAndSetDeadStock)}
          data={deadStockItems}
          filters={deadStockFilters}
        />
      )}

      {/* Notification Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalType === 'success' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Succès</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600">Erreur</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className={`p-4 rounded-lg ${
                modalType === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  modalType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {modalMessage}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
