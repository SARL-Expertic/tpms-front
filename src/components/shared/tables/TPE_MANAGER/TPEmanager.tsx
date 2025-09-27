"use client"
import { useEffect, useState, useCallback } from "react"
import { fetchTPES_Manager } from "@/app/api/tickets"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TPEDetailsButton } from "../../modal/tpe/TPEdetailsButton"
import { 
  FaChevronDown, 
  FaChevronRight, 
  FaIndustry, 
  FaSearch, 
  FaSync, 
  FaFilter,
  FaPlus 
} from "react-icons/fa"
import NewBrandModal from "../../modal/tpe/Nouvelle_marque"
import NewModelModal from "../../modal/tpe/Nouvelle_model"
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton"

interface TPE {
  id: string
  serialNumber: string
  type: string
  model: string
  manufacturer: string
  telecomOperator: string
  label: string
  status: string
  bankId: string | number
  clientId: string | number
  purchaseDate?: string
  warrantyExpiry?: string
  createdAt?: string
  updatedAt?: string
}

interface GroupedTPE {
  [manufacturer: string]: TPE[]
}

export default function TPESTable() {
  const [tpes, setTpes] = useState<TPE[]>([])
  const [groupedTpes, setGroupedTpes] = useState<GroupedTPE>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetchTPES_Manager()
      const transformed = res.data.map((tpe: any) => {
        const model = tpe?.manufacturer?.models?.find((m: any) => m.id === tpe.modelId)
        
        return {
          id: tpe?.id?.toString() ?? "",
          serialNumber: tpe?.serialNumber ?? "-",
          type: "POS",
          model: model?.name ?? "-",
          manufacturer: tpe?.manufacturer?.name ?? "-",
          telecomOperator: "-",
          label: model?.description ?? "-",
          status: "EN ATTENTE",
          bankId: "-",
          clientId: "-",
          purchaseDate: "",
          warrantyExpiry: "",
          createdAt: tpe?.createdAt
            ? format(new Date(tpe.createdAt), "dd/MM/yyyy HH:mm")
            : "",
          updatedAt: tpe?.updatedAt
            ? format(new Date(tpe.updatedAt), "dd/MM/yyyy HH:mm")
            : "",
        }
      })

      const sorted = transformed.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt.split(" ")[0].split("/").reverse().join("-")) : new Date(0)
        const dateB = b.createdAt ? new Date(b.createdAt.split(" ")[0].split("/").reverse().join("-")) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })

      const grouped: GroupedTPE = {}
      sorted.forEach((tpe: TPE) => {
        if (!grouped[tpe.manufacturer]) {
          grouped[tpe.manufacturer] = []
        }
        grouped[tpe.manufacturer].push(tpe)
      })

      setTpes(sorted)
      setGroupedTpes(grouped)
      setExpandedBrands(new Set(Object.keys(grouped)))
    } catch (err) {
      console.error("Erreur lors du chargement des TPEs:", err)
      setError(err as Error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  const toggleBrand = (manufacturer: string) => {
    setExpandedBrands(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(manufacturer)) {
        newExpanded.delete(manufacturer)
      } else {
        newExpanded.add(manufacturer)
      }
      return newExpanded
    })
  }

  const toggleAllBrands = () => {
    if (expandedBrands.size === Object.keys(groupedTpes).length) {
      setExpandedBrands(new Set())
    } else {
      setExpandedBrands(new Set(Object.keys(groupedTpes)))
    }
  }

  const filteredGroupedTpes = Object.entries(groupedTpes).reduce((acc, [manufacturer, tpes]) => {
    const filteredTpes = tpes.filter(tpe =>
      tpe.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpe.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpe.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    if (filteredTpes.length > 0) {
      acc[manufacturer] = filteredTpes
    }
    
    return acc
  }, {} as GroupedTPE)

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "EN ATTENTE": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "EN MAINTENANCE": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "AU SATEM": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "EN UTILISATION": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    }
    return colorMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }

  if (loading) {
    return (
                <CardSkeleton />
      
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="mb-4">Erreur lors du chargement des TPEs.</p>
            <Button onClick={handleRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FaIndustry className="text-blue-600" />
                Tableau des TPEs par Marque
              </CardTitle>
              <CardDescription>
                {Object.keys(groupedTpes).length} marques • {tpes.length} TPEs au total
                {searchTerm && ` • ${Object.values(filteredGroupedTpes).flat().length} résultat(s) trouvé(s)`}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <NewBrandModal onSuccess={handleRefresh}>
                <Button size="sm" className="flex items-center gap-2">
                  <FaPlus className="text-sm" />
                  Marque
                </Button>
              </NewBrandModal>
              
              <NewModelModal onSuccess={handleRefresh}>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <FaPlus className="text-sm" />
                  Modèle
                </Button>
              </NewModelModal>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleAllBrands}
                disabled={Object.keys(groupedTpes).length === 0}
              >
                {expandedBrands.size === Object.keys(groupedTpes).length ? "Tout réduire" : "Tout développer"}
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSync className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par modèle, numéro de série ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                ×
              </Button>
            )}
          </div>

          {/* TPEs List */}
          <div className="space-y-4">
            {Object.keys(filteredGroupedTpes).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Aucun TPE trouvé pour votre recherche." : "Aucun TPE disponible."}
              </div>
            ) : (
              Object.entries(filteredGroupedTpes).map(([manufacturer, manufacturerTpes]) => (
                <Card key={manufacturer} className="overflow-hidden">
                  {/* Brand Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all"
                    onClick={() => toggleBrand(manufacturer)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {expandedBrands.has(manufacturer) ? (
                          <FaChevronDown className="text-gray-500 transition-transform" />
                        ) : (
                          <FaChevronRight className="text-gray-500 transition-transform" />
                        )}
                        <FaIndustry className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {manufacturer}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {manufacturerTpes.length} TPE{manufacturerTpes.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                      {manufacturerTpes.length}
                    </Badge>
                  </div>

                  {/* Models Table */}
                  {expandedBrands.has(manufacturer) && (
                    <div className="border-t">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Modèle</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">N° Série</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Statut</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Mis à jour</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {manufacturerTpes.map((tpe) => (
                              <tr key={tpe.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                                  #{tpe.id}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {tpe.model}
                                    </span>
                                    {tpe.label && tpe.label !== "-" && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {tpe.label}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                  {tpe.serialNumber}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge className={getStatusColor(tpe.status)}>
                                    {tpe.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  {tpe.updatedAt || "-"}
                                </td>
                                <td className="px-4 py-3">
                                  <TPEDetailsButton tpe={tpe} onUpdate={handleRefresh} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}