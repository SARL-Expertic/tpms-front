"use client";

import { DataTable } from "../data-table";
import { useEffect, useState, useCallback } from "react";
import { fetchConsumables, fetchConsumablesItems } from "@/app/api/tickets";
import { ConsumableColumns } from './columns'
import ConsumableModal from "../../modal/CONSUMBLE/Nouvelle_CONSUMBLE";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FaPlus, 
  FaSync, 
  FaSearch, 
  FaExclamationTriangle,
  FaBoxOpen,
  FaFilter 
} from "react-icons/fa";
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton";

type Consumable = {
  id: number;
  type: string;
  quantity: number;
  minStock?: number;
  category?: string;
  lastRestocked?: string;
};

export default function ConsumablesTable() {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lowStockFilter, setLowStockFilter] = useState(false);

  const loadConsumables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchConsumablesItems();
      // Simulate enriched data - in real app, this would come from API
      const enrichedData = (res.data || []).map((item: any) => ({
        ...item,
        minStock: item.minStock || 10,
        category: item.category || "General",
        lastRestocked: item.lastRestocked || new Date().toISOString()
      }));
      setConsumables(enrichedData);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des consommables:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConsumables();
  }, [loadConsumables]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConsumables();
  };

  const filteredConsumables = consumables.filter(consumable => {
    const matchesSearch = consumable.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consumable.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !lowStockFilter || consumable.quantity <= (consumable.minStock || 10);
    return matchesSearch && matchesLowStock;
  });

  const lowStockItems = consumables.filter(item => item.quantity <= (item.minStock || 10));
  const totalStockValue = consumables.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
                <CardSkeleton />
      
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
            <p className="mb-4">Erreur lors du chargement des consommables.</p>
            <Button onClick={handleRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className=" space-y-6 mt-6 ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FaBoxOpen className="text-blue-600" />
                Gestion des Consommables
              </CardTitle>
              <CardDescription>
                {consumables.length} types de consommables • {totalStockValue} unités totales
                {lowStockItems.length > 0 && (
                  <span className="text-orange-600 ml-2">
                    • {lowStockItems.length} en stock faible
                  </span>
                )}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <ConsumableModal onSuccess={handleRefresh}>
                <Button className="flex items-center gap-2">
                  <FaPlus className="text-sm" />
                  Nouveau Consommable
                </Button>
              </ConsumableModal>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSync className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{consumables.length}</div>
                <div className="text-sm text-blue-600">Types de consommables</div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">{totalStockValue}</div>
                <div className="text-sm text-green-600">Unités en stock</div>
              </CardContent>
            </Card>
            
            <Card className={`${lowStockItems.length > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <CardContent className="pt-4">
                <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                  {lowStockItems.length}
                </div>
                <div className={`text-sm ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                  Stock faible
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par type ou catégorie..."
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
            
            <Button
              variant={lowStockFilter ? "default" : "outline"}
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className="flex items-center gap-2"
            >
              <FaFilter className="text-sm" />
              Stock faible {lowStockFilter && `(${lowStockItems.length})`}
            </Button>
          </div>

          {/* Results Info */}
          {searchTerm || lowStockFilter ? (
            <div className="mb-4 text-sm text-gray-600">
              {filteredConsumables.length} résultat(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
              {lowStockFilter && " (stock faible)"}
            </div>
          ) : null}

          {/* Data Table */}
          {filteredConsumables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaBoxOpen className="mx-auto text-4xl mb-4 text-gray-300" />
              <p>Aucun consommable trouvé.</p>
              {searchTerm || lowStockFilter ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setLowStockFilter(false);
                  }}
                  className="mt-2"
                >
                  Voir tous les consommables
                </Button>
              ) : (
                <ConsumableModal onSuccess={handleRefresh}>
                  <Button variant="outline" className="mt-2">
                    Ajouter le premier consommable
                  </Button>
                </ConsumableModal>
              )}
            </div>
          ) : (
            <DataTable 
            recherche={false}
              columns={ConsumableColumns} 
              data={filteredConsumables.map(consumable => ({
                ...consumable, 
                onRefresh: handleRefresh
              }))} 
              filters={[]}
            />
          )}
    </div>
  );
}