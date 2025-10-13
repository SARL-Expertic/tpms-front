"use client";
import { DataTable } from "../data-table";
import { useEffect, useState, useCallback } from "react";
import { fetchbanks } from "@/app/api/tickets";
import { BankColumns } from "./columns";
import { CreateBankModal } from "../../modal/Bank/Nouvelle_bank";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FaBuilding, 
  FaSync, 
  FaSearch, 
  FaPlus, 
  FaMapMarkerAlt,
  FaUsers,
  FaCreditCard,
  FaFilter,
  FaChartLine,
  FaEye,
  FaTable,
  FaTh
} from "react-icons/fa";
import { BankDetailsButton } from "../../modal/Bank/BankdetailsButton";
import { CardSkeleton } from "@/components/magic-loaders/card-skeleton";
type Bank = {
  id: number;
  name: string;
  code: string;
  phoneNumber?: string;
  numberofaccount?: number;
  terminaltpemarques?: string;
  currentLocation?: {
    id: number;
    name: string;
    address: string;
    wilaya: string | null;
    daira: string | null;
    localite: string | null;
    latitude?: number | null;
    longitude?: number | null;
    clientId?: number | null;
    createdAt?: string;
    updatedAt?: string;
  };
  status?: string;
  subaccounts: { id: number; name: string; email: string, phone: string }[];
  tpes: { 
    id: number;
    name: string;
    models: { id: number; name: string }[] 
  }[];
  employees?: { 
    id: number; 
    firstName: string; 
    lastName: string; 
    email: string; 
    phone: string;
  }[];
  preferredTerminalTypes?: {
    id: number;
    terminalType: {
      id: number;
      model: {
        id: number;
        name: string;
      };
      manufacturer: {
        id: number;
        name: string;
      };
    };
  }[];
};

type ViewMode = 'table' | 'grid' | 'stats';

export default function BanksTable() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadBanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchbanks();
      const transformed = res.data.banks.map((bank: any) => ({
        id: bank.id,
        name: bank.name,
        code: bank.code,
        phoneNumber: bank.phoneNumber || 'N/A',
        currentLocation: bank.currentLocation || undefined,
        status: bank.status || 'INACTIVE',
        numberofaccount: Array.isArray(bank.employees) ? bank.employees.length : 0,
        terminaltpemarques: bank.preferredTerminalTypes && Array.isArray(bank.preferredTerminalTypes)
          ? bank.preferredTerminalTypes.map((ptt: any) => {
              const manufacturer = ptt.terminalType?.manufacturer?.name || 'N/A';
              const model = ptt.terminalType?.model?.name || '';
              return `${manufacturer} ${model}`.trim();
            }).join(', ') 
          : 'N/A',
        subaccounts: Array.isArray(bank.employees)
          ? bank.employees.map((emp: any) => ({
              id: emp.id || 0,
              name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
              email: emp.email || 'N/A',
              phone: emp.phone || 'N/A',
            }))
          : [],
        tpes: bank.preferredTerminalTypes && Array.isArray(bank.preferredTerminalTypes)
          ? bank.preferredTerminalTypes.map((ptt: any) => ({
              id: ptt.terminalType?.id || 0,
              name: ptt.terminalType?.manufacturer?.name || 'N/A',
              models: [{
                id: ptt.terminalType?.model?.id || 0,
                name: ptt.terminalType?.model?.name || 'N/A'
              }]
            }))
          : [],
      }));
      setBanks(transformed);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des banques:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadBanks();
  };

  const filteredBanks = banks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bank.terminaltpemarques?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bank.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeBanks = banks.filter(bank => bank.status === 'ACTIVE').length;
  const totalEmployees = banks.reduce((sum, bank) => sum + bank.numberofaccount!, 0);
  const totalTerminalTypes = banks.reduce((sum, bank) => sum + (bank.tpes?.length || 0), 0);

  const BankStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Banques</p>
              <p className="text-2xl font-bold text-blue-700">{banks.length}</p>
            </div>
            <FaBuilding className="text-3xl text-blue-500 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Banques Actives</p>
              <p className="text-2xl font-bold text-green-700">{activeBanks}</p>
            </div>
            <FaChartLine className="text-3xl text-green-500 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Employés</p>
              <p className="text-2xl font-bold text-purple-700">{totalEmployees}</p>
            </div>
            <FaUsers className="text-3xl text-purple-500 opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Types TPE</p>
              <p className="text-2xl font-bold text-orange-700">{totalTerminalTypes}</p>
            </div>
            <FaCreditCard className="text-3xl text-orange-500 opacity-60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BankGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBanks.map((bank) => (
        <Card key={bank.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                  {bank.name}
                </h3>
                <Badge className={
                  bank.status === 'ACTIVE' 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }>
                  {bank.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    {bank.code}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-400" />
                  <span>{bank.numberofaccount} employés</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaCreditCard className="text-gray-400" />
                  <span className="truncate">{bank.terminaltpemarques}</span>
                </div>
                
                {bank.currentLocation && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span className="truncate">{bank.currentLocation.wilaya || 'Localisation'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t">
              <BankDetailsButton 
                bank={bank} 
                onSave={(updatedBank) => {
                  // Update the bank in the local state
                  setBanks(prev => prev.map(b => 
                    b.id === updatedBank.id ? {
                      ...updatedBank,
                      terminaltpemarques: updatedBank.tpes 
                        ? updatedBank.tpes.map(tpe => tpe.name).join(', ')
                        : 'N/A',
                      numberofaccount: updatedBank.subaccounts?.length || 0
                    } : b
                  ));
                  // Refresh the data to get the latest from server
                  loadBanks();
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
            <div className="text-4xl mb-4">🏦</div>
            <p className="mb-4">Erreur lors du chargement des banques.</p>
            <Button onClick={handleRefresh} variant="outline">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className=" space-y-6 mt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                <FaBuilding className="text-blue-600" />
                Gestion des Banques
              </CardTitle>
              <CardDescription className="text-lg">
                {banks.length} banques • {activeBanks} actives • {totalEmployees} employés
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <CreateBankModal onCreate={(newBank: any) => {
                setBanks(prev => [...prev, {
                  id: newBank.id,
                  name: newBank.name,
                  code: newBank.code ?? 'N/A',
                  phoneNumber: newBank.phoneNumber ?? 'N/A',
                  currentLocation: newBank.currentLocation ?? undefined,
                  status: newBank.status ?? 'INACTIVE',
                  numberofaccount: Array.isArray(newBank.employees) ? newBank.employees.length : 0,
                  terminaltpemarques: newBank.preferredTerminalTypes && Array.isArray(newBank.preferredTerminalTypes)
                    ? newBank.preferredTerminalTypes.map((ptt: any) => {
                        const manufacturer = ptt.terminalType?.manufacturer?.name || 'N/A';
                        const model = ptt.terminalType?.model?.name || '';
                        return `${manufacturer} ${model}`.trim();
                      }).join(', ') 
                    : 'N/A',
                  subaccounts: Array.isArray(newBank.employees)
                    ? newBank.employees.map((emp: any) => ({
                        id: emp.id || 0,
                        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                        email: emp.email || 'N/A',
                        phone: emp.phone || 'N/A',
                      }))
                    : [],
                  tpes: newBank.preferredTerminalTypes && Array.isArray(newBank.preferredTerminalTypes)
                    ? newBank.preferredTerminalTypes.map((ptt: any) => ({
                        id: ptt.terminalType?.id || 0,
                        name: ptt.terminalType?.manufacturer?.name || 'N/A',
                        models: [{
                          id: ptt.terminalType?.model?.id || 0,
                          name: ptt.terminalType?.model?.name || 'N/A'
                        }]
                      }))
                    : [],
                }]);
              }} />
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <FaSync className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <BankStats />

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, code ou type TPE..."
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
            
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="ACTIVE">Actives</option>
                <option value="INACTIVE">Inactives</option>
              </select>
              
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-none border-0"
                >
                  <FaTable />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none border-0"
                >
                  <FaTh />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mb-4 text-sm text-gray-600">
              {filteredBanks.length} résultat(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
              {statusFilter !== 'all' && ` (statut: ${statusFilter})`}
            </div>
          )}

          {/* Content */}
          {filteredBanks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏦</div>
              <p className="text-lg mb-2">Aucune banque trouvée</p>
              <p className="text-sm mb-4">Essayez de modifier vos critères de recherche</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter('all');
                }}
              >
                Voir toutes les banques
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <BankGrid />
          ) : (
            <DataTable recherche={false} columns={BankColumns} data={filteredBanks} filters={[]} />
          )}
    </div>
  );
}