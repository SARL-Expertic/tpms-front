"use client";

import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { fetchConsumables } from "@/app/api/tickets"; // 👉 API call to fetch consumables
import { ConsumableColumns } from './columns'
import ConsumableModal from "../../modal/CONSUMBLE/Nouvelle_CONSUMBLE";

type Consumable = {
  id: number;
  name: string;
  quantity: number;
};

export default function ConsumablesTable() {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchConsumables()
      .then((res) => {
        setConsumables(res.data.consumables || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des consommables:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau des Consommables</h1>
        <ConsumableModal />
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div>Erreur lors du chargement des consommables.</div>
      ) : (
        <DataTable columns={ConsumableColumns} data={consumables} filters={[]}
          className_css="border-separate border-spacing-x-4" // 👈 adds spacing between columns
        />
      )}
    </div>
  );
}
