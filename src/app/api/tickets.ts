import api from "./axios";
import { ENDPOINTS } from "./endpoints";

// Shared interfaces for client fields
interface ClientBase {
  bank_id?: number | null;
  client_commercialName: string;
  client_phoneNumber: string;
  client_brand: string;
  client_wilaya: string;
  client_daira: string;
  client_address: string;
  notes: string;
}

interface NewOrExistingClient extends ClientBase {
  new_client: boolean;
  client_id?: number;
}

type SubAccount = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
};

type TPEModel = {
  id: number;
  name: string;
};

type TPE = {
  id: number;
  name: string;
  models: TPEModel[];
};

export const fetchbanks = () => api.get(ENDPOINTS.BANKS);
export const fetchTickets = () => api.get(ENDPOINTS.TICKETS);

export const fetchTickets_Manager = () => api.get(ENDPOINTS.TICKETS_MANAGER);

export const fetchClients_Manager = () => api.get(ENDPOINTS.CLIENTS_MANAGER);
export const fetchTPES_Manager = () => api.get(ENDPOINTS.TPES_MANAGER);

export const fetchTPE = () => api.get(ENDPOINTS.TPE);

export const createNetworkCheckTicket = (
  data: ClientBase & { notes: string }
) => api.post(ENDPOINTS.NETWORK_CHECK, data);

export const createInterventionTicket = (
  data: NewOrExistingClient & {
    tpe_model: string;
    problem_description: string;
    tpe_serialNumber: string;
  }
) => api.post(ENDPOINTS.INTERVENTION, data);

export const createDeblockingTicket = (data: {
  bank_id?: number | null;
  notes: string;
  deblockingType: string;
  tpes: { id: number }[];
}) => api.post(ENDPOINTS.DEBLOCKING, data);

export const fetchClients = () => api.get(ENDPOINTS.CLIENTS);

export const createConsumableTicket = (
  data: NewOrExistingClient & {
    consumables: { type: string; quantity: number }[];
  }
) => api.post(ENDPOINTS.CONSUMABLE, data);

export async function fetchConsumableConstatData() {
  // Fake API response
  return new Promise<{
    data: {
      consumables: {
        id: number;
        name: string;
        quantity: number;
        reserved: number;
      }[];
    };
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          consumables: [
            { id: 1, name: "Printer Ink Cartridge", quantity: 25, reserved: 5 },
            { id: 2, name: "A4 Paper Pack", quantity: 120, reserved: 20 },
            { id: 3, name: "Staples", quantity: 500, reserved: 50 },
            { id: 4, name: "Whiteboard Markers", quantity: 30, reserved: 10 },
            { id: 5, name: "Cleaning Wipes", quantity: 60, reserved: 15 },
            { id: 6, name: "USB Flash Drive", quantity: 15, reserved: 2 },
          ],
        },
      });
    }, 1000);
  });
}

export const fetchConsumables = () => fetchConsumableConstatData();

export const clientfetch = (bankId: number) =>
  api.get(`${ENDPOINTS.CLIENTS_MANAGER}?bankId=${bankId}`);

export const fetchtpetypes = () => api.get(ENDPOINTS.TPEMODELS);

export const fetchConsumablesItems = () => api.get(ENDPOINTS.CONSUMABLEITEMS);
export const updateconsumableitem = (
  id: number,
  quantity: number,
  type?: string
) => api.put(`${ENDPOINTS.CONSUMABLEITEMS}/${id}`, { quantity, type });
export const createconsumableitem = (quantity: number, type: string) =>
  api.post(ENDPOINTS.CONSUMABLEITEMS, { quantity, type });
export const deleteconsumableitem = (id: number) =>
  api.delete(`${ENDPOINTS.CONSUMABLEITEMS}/${id}`);

export const terminalperbankfetch = (bankId: number) =>
  api.get(`${ENDPOINTS.TERMINALTYPES}?bankId=${bankId}`);

export const terminaltypesfetch = () => api.get(ENDPOINTS.TERMINALTYPES);

export const createmanfacturer = (
  manufacturer_name: string,
  model_name: string,
  model_description: string
) =>
  api.post(ENDPOINTS.createmanfacturer, {
    manufacturer_name,
    model_name,
    model_description,
  });

export const createModel = (data: {
  manufacturer_id: number;
  model_name: string;
  description?: string;
}) => api.post(ENDPOINTS.CREATEMODEL, data);

export const createbank = (data: {
  bank_name: string;
  bank_code: string;
  address: string;
  phone_number: string;
  secondaryPhone?: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE";
  existingTerminalTypeIds: number[];
  employeeIdsToRemove: number[];
  terminalTypeIdsToRemove: number[];
  terminalTypesToAdd: { id: number }[];
  employees: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    plainPassword: string;
  }[];
}) => api.post(ENDPOINTS.CREATEBANK, data);

export const updatebank = (
  id: number,
  data: {
    bank_name: string;
    bank_code: string;
    address: string;
    phone_number?: string;
    secondaryPhone?: string;
    email?: string;
    status: "ACTIVE" | "INACTIVE";
    existingTerminalTypeIds: number[];
    employees: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      plainPassword?: string;
    }[];
  }
) => api.put(`${ENDPOINTS.UPDATEBANK}/${id}`, data);

export const closeticket = (ticketId: number) =>
  api.get(`${ENDPOINTS.CLOSETICKET}/${ticketId}`);
