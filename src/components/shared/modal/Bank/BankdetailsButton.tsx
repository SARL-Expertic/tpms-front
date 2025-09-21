"use client";

import { FaInfoCircle, FaBuilding, FaUsers, FaCreditCard } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DynamicModal } from "../Modal";

type Subaccount = {
  id: number;
  name: string;
  email: string;
};

type TpeModel = {
  id: number;
  name: string;
};

type TpeBrand = {
  id: number;
  name: string;
  models: TpeModel[];
};

type Bank = {
  id: number;
  name: string;
  status?: string; // optional, in case banks have states
  subaccounts: Subaccount[];
  tpes: TpeBrand[];
};

type Props = {
  bank: Bank;
};

const statusColorMap: Record<string, string> = {
  ACTIVE: "bg-green-600",
  INACTIVE: "bg-red-500",
  PENDING: "bg-orange-500",
};

export function BankDetailsButton({ bank }: Props) {
  return (
    <DynamicModal
      triggerLabel={
        <Button
          size="sm"
          className="flex bg-blue-600 hover:bg-blue-700 cursor-pointer items-center gap-2"
        >
          <FaInfoCircle className="text-lg" />
          Détails
        </Button>
      }
      title={`Banque: ${bank.name}`}
      description={`Informations complètes pour la banque #${bank.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-6 p-1">
        {/* Bank Header */}
        <div className="dark:from-slate-800 dark:to-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              {bank.name}
            </h2>
            {bank.status && (
              <Badge
                className={`flex items-center ${
                  statusColorMap[bank.status] || "bg-gray-500"
                } gap-2 px-3 py-2 text-sm`}
              >
                {bank.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">ID: {bank.id}</p>
        </div>

        {/* Subaccounts */}
        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <FaUsers className="text-green-600 dark:text-green-400" />
            </div>

            Sous-comptes ({bank?.subaccounts?.length})

            
          </h3>
          {bank?.subaccounts?.length === 0 ? (
            <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">
              Aucun sous-compte
            </p>
          ) : (
            <div className="ml-12 grid gap-2 text-sm">
              {bank?.subaccounts?.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2 rounded-md bg-muted/20 border"
                >
                  <div>
                    <span className="text-muted-foreground">Nom:</span>{" "}
                    {sub.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {sub.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TPE Brands & Models */}
        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <FaCreditCard className="text-orange-600 dark:text-orange-400" />
            </div>
            TPEs (Marques & Modèles)
          </h3>
          {bank.tpes.length === 0 ? (
            <p className="text-sm bg-muted/30 rounded-lg p-4 ml-12">
              Aucune marque TPE
            </p>
          ) : (
            <div className="ml-12 grid gap-4 text-sm">
              {bank.tpes.map((brand) => (
                <div key={brand.id} className="p-3 rounded-md bg-muted/20 border">
                  <div className="font-semibold">{brand.name}</div>
                  {brand.models.length > 0 ? (
                    <ul className="list-disc list-inside pl-4">
                      {brand.models.map((model) => (
                        <li key={model.id}>{model.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Aucun modèle</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DynamicModal>
  );
}
