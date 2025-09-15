// filter_Tickets.ts
import { FilterConfig } from "@/types/tables/filter";

export const filter_Tickets_manager: FilterConfig<any>[] = [
  {
    key: "bank",
    placeholder: "Banque...",
    label: "Toutes les banques",
  },

  {
    key: "type",
    placeholder: "Type de ticket...",
    label: "Tous les types",
  },
  {
    key: "status",
    placeholder: "Statut...",
    label: "Tous les statuts",
  },
  {
    key: "model",
    placeholder: "Modèle...",
    label: "Tous les modèles",
  },
  {
    key: "brand",
    placeholder: "Marque...",
    label: "Toutes les marques",
  },

];
