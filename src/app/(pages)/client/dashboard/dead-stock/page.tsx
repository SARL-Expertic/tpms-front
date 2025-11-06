"use client"

import { useEffect, useState } from "react"
import DeadStockTable from "@/components/shared/tables/dead_stock_client/deadStockTable"
import { FETCH_DEAD_STOCK_CLIENT_SUMMARY } from "@/app/api/tickets"
import { FaBox, FaLayerGroup, FaChartBar } from "react-icons/fa"
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton"
import { getConditionLabel } from "@/constants/deadstock/conditions"

type SummaryData = {
  totalAssigned: number
  totalQuantity: number
  byCondition: {
    _count: { id: number }
    condition: string
  }[]
}

export default function DeadStockPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    FETCH_DEAD_STOCK_CLIENT_SUMMARY()
      .then((res) => {
        setSummary(res.data.summary)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching summary:", err)
        setLoading(false)
      })
  }, [])

  const getConditionColor = (condition: string) => {
    const colorMap: Record<string, string> = {
      NEW: "from-green-500 to-green-600",
      USED: "from-blue-500 to-blue-600",
      REFURBISHED: "from-cyan-500 to-cyan-600",
      DAMAGED: "from-orange-500 to-orange-600",
      OUT_OF_ORDER: "from-red-500 to-red-600",
    }
    return colorMap[condition] || "from-gray-500 to-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-8 gap-6">
            {/* Total Items Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    Total d'Articles
                  </p>
                  <p className="text-3xl font-bold">{summary.totalAssigned}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <FaBox className="text-3xl" />
                </div>
              </div>
            </div>

            {/* Total Quantity Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Quantité Totale
                  </p>
                  <p className="text-3xl font-bold">{summary.totalQuantity}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <FaLayerGroup className="text-3xl" />
                </div>
              </div>
            </div>

            {/* Conditions Card */}
         
          </div>

          {/* Condition Breakdown */}
          {summary.byCondition.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartBar className="text-blue-600" />
                Répartition par Condition
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {summary.byCondition.map((item) => (
                  <div
                    key={item.condition}
                    className={`bg-gradient-to-br ${getConditionColor(
                      item.condition
                    )} rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-shadow`}
                  >
                    <p className="text-sm opacity-90 mb-1">
                      {getConditionLabel(item.condition)}
                    </p>
                    <p className="text-2xl font-bold">
                      {item._count.id}
                    </p>
                    <p className="text-xs opacity-75 mt-1">article(s)</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Dead Stock Table */}
      <DeadStockTable />
    </div>
  )
}