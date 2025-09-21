"use client";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { fetchbanks } from "@/app/api/tickets";
import { BankColumns } from "./columns";
import { CreateBankModal } from "../../modal/Bank/Nouvelle_bank";

type Bank = {
  id: number;
  name: string;
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
        setBanks(res.data.constantBanks); // ✅ keep full structure
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
        <CreateBankModal onCreate={(newBank) => setBanks((prev) => [...prev, newBank])} />
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
