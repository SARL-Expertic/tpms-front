"use client";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { fetchbanks } from "@/app/api/tickets";
import { BankColumns } from "./columns"; // 👉 we’ll define this next

type Bank = {
  id: number;
  name: string;
  subaccounts: { id: number; accountNumber: string }[];
};

export default function BanksTable() {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchbanks()
      .then((res) => {
        const transformed = res.data.banks.map((bank: Bank) => ({
          id: bank.id,
          name: bank.name,
          subaccountCount: bank.subaccounts?.length || 0,
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
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur lors du chargement des banques.</div>
      ) : (
        <DataTable
          columns={BankColumns}
          data={banks}
          filters={[]} // 👉 no filters unless you need
        />
      )}
    </div>
  );
}
