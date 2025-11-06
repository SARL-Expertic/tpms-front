export interface Ticket {
  id: string;
  type: string;
  status: string;
  note: string;
  bankname?: string;
  bankTicketId?: string;
  bank?: {
    id: number;
    name: string;
  };
  tpe: {
    serialNumber: string;
    model: string;
    id_model: string;
    brand: string;
    id_brand: string;
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
  };
  requestDate: string;  
  deliveredDate: string; // already formatted with date-fns
  completedDate: string; // already formatted with date-fns
  deblockingOrder?: {
    id: string;
    type: string;
    items: { 
      id: number; 
      terminalType: {
        manufacturer: { name: string; };
        model: { name: string; };
      };
      status: string;
      requestDate?: string;
    }[];
  };
  problemDescription?: string;
  intervention?: {
    problem: string;
  };
  consumableRequest?: {
    items: { type: string; quantity: number; }[];
  };
}