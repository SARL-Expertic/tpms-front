"use client";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { fetchbanks } from "@/app/api/tickets";
import { BankColumns } from "./columns";
import { CreateBankModal } from "../../modal/Bank/Nouvelle_bank";

type Bank = {
  id: number;
  name: string;
  code: string; // Ensure 'code' is present and required
  phoneNumber?: string;
  currentLocation?: {
    id: number;
    name: string;
    address: string;
    wilaya: string;
    daira: string;
    localite: string;
  }
  status?: string;
  subaccounts: { id: number; name: string; email: string }[];
  tpes: { id: number; name: string; models: { id: number; name: string }[] }[];
};

export default function BanksTable() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchbanks()
      .then((res) => {
        const transformed = res.data.banks.map((bank: any) => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          phoneNumber: bank.phoneNumber || 'N/A',
          currentLocation: bank.currentLocation || undefined,
          status: bank.status || 'N/A',
          subaccounts: Array.isArray(bank.employees)
            ? bank.employees.map((emp: any) => ({
                id: emp.id || 0,
                name: (emp.firstName ? emp.firstName : '') + ' ' + (emp.lastName ? emp.lastName : ''),
                email: emp.email || 'N/A',
              }))
            : [],
          tpes: bank.preferredTerminalTypes || [],
        }));
        setBanks(transformed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des banques:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau des Banques</h1>
        <CreateBankModal onCreate={(newBank) => {
          setBanks((prev) => [
            ...prev,
            {
              id: newBank.id,
              name: newBank.name,
              code: newBank.code ?? 'N/A',
              phoneNumber: newBank.phoneNumber ?? 'N/A',
              currentLocation: newBank.currentLocation ?? undefined,
              status: newBank.status ?? 'N/A',
              subaccounts: Array.isArray(newBank.subaccounts)
                ? newBank.subaccounts.map((emp: any) => ({
                    id: emp.id || 0,
                    name: (emp.firstName ? emp.firstName : '') + ' ' + (emp.lastName ? emp.lastName : ''),
                    email: emp.email || 'N/A',
                  }))
                : [],
              tpes: Array.isArray(newBank.tpes)
                ? newBank.tpes.map((tpe: any) => ({
                    id: tpe.id,
                    name: tpe.name ?? 'N/A',
                    models: Array.isArray(tpe.models)
                      ? tpe.models.map((model: any) => ({
                          id: model.id,
                          name: model.name ?? 'N/A',
                        }))
                      : [],
                  }))
                : [],
            },
          ]);
        }} />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur lors du chargement des banques.</div>
      ) : (
        <DataTable columns={BankColumns} data={banks} filters={[]} />
      )}
    </div>
  );
}
