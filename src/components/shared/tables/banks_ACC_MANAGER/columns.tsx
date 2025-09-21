"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BankDetailsButton } from "../../modal/Bank/BankdetailsButton";

export type BankRow = {
  id: number;
  name: string;
  subaccountCount: number;
};

export const BankColumns: ColumnDef<BankRow>[] = [
  {
    accessorKey: "id",
    header: "Bank ID",
  },
  {
    accessorKey: "name",
    header: "Bank Name",
  },
  {
    accessorKey: "subaccountCount",
    header: "Number of Accounts",
  },
  {
    header: 'Actions',
    cell: ({ row }) => (
      <BankDetailsButton bank={row}/>
    )
  }
];
