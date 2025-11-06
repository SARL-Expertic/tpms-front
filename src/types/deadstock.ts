// Dead Stock Types
export type DeadStock = {
  id: number;
  name: string;
  quantity: number;
  condition: string;
  notes: string;
  bankname?: string; // For manager view
  bankName?: string; // For client view (mapped from bank.name)
  bank?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type DeadStockFormData = {
  name: string;
  quantity: number;
  condition: string;
  notes: string;
  bankId?: number;
  isActive?: boolean;
};
