// columns.ts
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BankDetailsButton } from "../../modal/Bank/BankdetailsButton";

import { Button } from "@/components/ui/button";

type BankRow = {
  id: number;
  name: string;
  status?: string;
  subaccounts: { id: number; name: string; email: string }[];
  tpes: { id: number; name: string; models: { id: number; name: string }[] }[];
};

export const BankColumns: ColumnDef<BankRow>[] = [
  { accessorKey: "id", header: "Bank ID" },
  { accessorKey: "name", header: "Bank Name" },
  { accessorKey: "status", header: "Status" },
  {
    header: "Actions",
    cell: ({ row }) => {
      const bank = row.original;
      return <BankDetailsButton bank={bank} />;
    },
  },
];
