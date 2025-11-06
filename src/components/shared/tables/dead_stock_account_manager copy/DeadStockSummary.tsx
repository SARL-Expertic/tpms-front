"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaBox, FaCheckCircle, FaTimesCircle, FaChartBar } from "react-icons/fa"
import { FETCH_DEAD_STOCK_SUMMARY } from "@/app/api/tickets"
import { getConditionLabel } from "@/constants/deadstock/conditions"
import { Badge } from "@/components/ui/badge"

type SummaryData = {
  total: number;
  assigned: number;
  unassigned: number;
  byCondition: Array<{
    _count: {
      id: number;
    };
    condition: string;
  }>;
}

export default function DeadStockSummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await FETCH_DEAD_STOCK_SUMMARY()
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching dead stock summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConditionColor = (condition: string) => {
    const colorMap: Record<string, string> = {
      "NEW": "bg-green-100 text-green-700 border-green-300",
      "USED": "bg-blue-100 text-blue-700 border-blue-300",
      "REFURBISHED": "bg-cyan-100 text-cyan-700 border-cyan-300",
      "DAMAGED": "bg-orange-100 text-orange-700 border-orange-300",
      "OUT_OF_ORDER": "bg-red-100 text-red-700 border-red-300",
    };
    return colorMap[condition] || "bg-gray-100 text-gray-700 border-gray-300";
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="mb-6 space-y-4">
      {/* Main Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Items */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FaBox className="text-blue-500" />
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
            <p className="text-xs text-gray-500 mt-1">Articles en stock</p>
          </CardContent>
        </Card>

        {/* Assigned */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FaCheckCircle className="text-green-500" />
              Assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.assigned}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.total > 0 ? `${Math.round((summary.assigned / summary.total) * 100)}%` : '0%'} du total
            </p>
          </CardContent>
        </Card>

        {/* Unassigned */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FaTimesCircle className="text-orange-500" />
              Non Assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{summary.unassigned}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.total > 0 ? `${Math.round((summary.unassigned / summary.total) * 100)}%` : '0%'} du total
            </p>
          </CardContent>
        </Card>

        {/* Conditions Count */}
       
      </div>

      {/* Condition Breakdown */}
      {summary.byCondition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Répartition par Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {summary.byCondition.map((item) => (
                <div
                  key={item.condition}
                  className={`p-4 rounded-lg border-2 ${getConditionColor(item.condition)} hover:shadow-md transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {getConditionLabel(item.condition)}
                    </span>
                    <Badge variant="secondary" className="font-bold">
                      {item._count.id}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all bg-current opacity-60"
                      style={{
                        width: summary.total > 0 
                          ? `${(item._count.id / summary.total) * 100}%` 
                          : '0%'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 font-medium">
                    {summary.total > 0 
                      ? `${Math.round((item._count.id / summary.total) * 100)}%` 
                      : '0%'} du total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
