"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BankDetailsButton } from "../../modal/Bank/BankdetailsButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaUsers, FaCreditCard, FaMapMarkerAlt, FaEye } from "react-icons/fa";

const statusColorMap: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-md",
  Inactif: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-md",
};

type BankRow = {
  id: number;
  name: string;
  code: string;
  status?: string;
  numberofaccount?: number;
  terminaltpemarques?: string;
  currentLocation?: {
    id: number;
    name: string;
    address: string;
    wilaya: string | null;
    daira: string | null;
    localite: string | null;
  };
  subaccounts: { id: number; name: string; email: string; phone: string }[];
  tpes: { id: number; name: string; models: { id: number; name: string }[] }[];
};

export const BankColumns: ColumnDef<BankRow>[] = [
  { 
    accessorKey: "id", 
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-blue-600 font-semibold">#{row.original.id}</span>
    ),
  },
  { 
    accessorKey: "name", 
    header: "Banque",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{row.original.name}</div>
        <div className="text-sm text-gray-500 font-mono">{row.original.code}</div>
      </div>
    ),
  },
  { 
    accessorKey: "terminaltpemarques", 
    header: "Terminaux TPE",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FaCreditCard className="text-gray-400 flex-shrink-0" />
        <span className="truncate max-w-[200px]">{row.original.terminaltpemarques || 'Aucun'}</span>
      </div>
    ),
  },
  { 
    accessorKey: "numberofaccount", 
    header: "Employés",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FaUsers className="text-gray-400" />
        <span>{row.original.numberofaccount || 0}</span>
      </div>
    ),
  },
  {
    accessorKey: "currentLocation",
    header: "Localisation",
    cell: ({ row }) => (
      row.original.currentLocation ? (
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
          <span className="truncate max-w-[150px]">
            {row.original.currentLocation.wilaya || row.original.currentLocation.name}
          </span>
        </div>
      ) : (
        <span className="text-gray-400">N/A</span>
      )
    ),
  },
  { 
    accessorKey: "status", 
    header: "Statut", 
    cell: ({ row }) => {
      const status = row.original.status ?? "INACTIVE";
      return (
        <Badge className={`${statusColorMap[status] || 'bg-gray-500'} font-medium`}>
          {status === 'ACTIVE' ? ' ACTIF' : ' INACTIF'}
        </Badge>
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bank = row.original;
      return (
        <div className="flex items-center gap-2">
          <BankDetailsButton 
            bank={bank} 
            onSave={(updatedBank) => {
              // Note: This will trigger a re-render, but the parent component
              // should handle the data refresh through its own state management
              console.log('Bank updated:', updatedBank);
            }} 
          />
        </div>
      );
    },
  },
];