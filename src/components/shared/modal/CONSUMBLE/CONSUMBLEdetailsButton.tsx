"use client";

import { Button } from "@/components/ui/button";
import { DynamicModal } from "../Modal";
import { FaInfoCircle, FaBox } from "react-icons/fa";

type Consumable = {
  id: number;
  name: string;
  quantity: number;
};

type Props = {
  consumable: Consumable;
};

export function ConsumableDetailsButton({ consumable }: Props) {
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
      title={`Consommable: ${consumable.name}`}
      description={`Informations sur le consommable #${consumable.id}`}
      cancelLabel="Fermer"
    >
      <div className="space-y-4 p-2">
        <div className="p-4 rounded-lg border bg-muted/20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaBox className="text-blue-600" /> {consumable.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {consumable.id}
          </p>
          <p className="mt-2 font-semibold">Quantité: {consumable.quantity}</p>
        </div>
      </div>
    </DynamicModal>
  );
}
