export interface Ticket {
  id: string;
  type: string;
  status: string;
  note: string;
  bank?: string;
  tpe: {
    serialNumber: string;
    model: string;
    brand: string;
  };
  client: {
    id: string;
    name: string;
    brand: string;
    phoneNumber: string;
    mobileNumber: string;
  location: {
    wilaya: string;
    daira: string;
    address: string;
  };
  requestDate: string;   // already formatted with date-fns
  completedDate: string; // already formatted with date-fns
  deblockingOrder?: {
    id: string;
    type: string;
    items: { id: number; model: string; brand: string; serialNumber: string }[];
  };
  problemDescription?: string;
  intervention?: {
    problem: string;
  };
};
consumableRequest?: {
    items: { type: string; quantity: number; }[];
  };
}