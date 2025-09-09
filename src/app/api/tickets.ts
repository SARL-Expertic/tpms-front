import api from './axios';
import { ENDPOINTS } from './endpoints';

export const fetchTickets = () => api.get(ENDPOINTS.TICKETS);

export const createTicket = (data: { title: string; description: string }) =>
  api.post(ENDPOINTS.TICKETS, data);

export const createNetworkCheckTicket = (data: {
  client_commercialName: string;
  client_phoneNumber: string;
  client_brand: string;
  client_wilaya: string;
  client_daira: string;
  client_address: string;
  notes: string;

}) =>
  api.post(ENDPOINTS.NETWORK_CHECK, data);

export const createInterventionTicket = (data: {
  client_commercialName: string;
  client_phoneNumber: string; 
  client_brand: string;
  client_wilaya: string;
  client_daira: string;
  client_address: string;
  tpe_model: string;
  problem_description: string;
  tpe_serialNumber: string;
}) =>
  api.post(ENDPOINTS.INTERVENTION, data);
