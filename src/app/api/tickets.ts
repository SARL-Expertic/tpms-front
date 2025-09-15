
import api from './axios';
import { ENDPOINTS } from './endpoints';

// Shared interfaces for client fields
interface ClientBase {
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
  notes: string;
  deblockingType: string;
  tpes: { id: number }[];
}) =>
  api.post(ENDPOINTS.DEBLOCKING, data);


export const fetchClients = () => api.get(ENDPOINTS.CLIENTS);


export const createConsumableTicket = (
  data: NewOrExistingClient & {
        consumables: { type: string; quantity: number }[];
  }
) => api.post(ENDPOINTS.CONSUMABLE, data);

export const fetchConsumables = () => api.get(ENDPOINTS.CONSUMABLE);