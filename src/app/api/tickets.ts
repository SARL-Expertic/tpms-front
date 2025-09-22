
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

type Bank = {
  id: number;
  name: string;
  address: string;
  principalPhone: string;
  status: "ACTIVE" | "INACTIVE";
  tpes: TPE[];
  subaccounts: SubAccount[];
};

const constantBanks: Bank[] = [
  {
    id: 5,
    name: "Arab Banking Corporation (ABC Algérie)",
    address: "Rue Didouche Mourad, Alger-Centre, Algérie",
    principalPhone: "+213 21 98 76 54",
    status: "INACTIVE",
    tpes: [
      {
        id: 7,
        name: "Ingenico",
        models: [{ id: 14, name: "iWL250" }],
      },
    ],
    subaccounts: [
      {
        id: 10,
        name: "Lydia Kaci",
        email: "lydia.kaci@abc.dz",
        phone: "+213 555 333 444",
        password: "hashed_password_here",
      },
      {
        id: 11,
        name: "Mohamed Amine",
        email: "amine.mohamed@abc.dz",
        phone: "+213 550 111 222",
        password: "hashed_password_here",
      },
    ],
  },
  {
    id: 6,
    name: "Banque Nationale d’Algérie (BNA)",
    address: "1 Boulevard Colonel Amirouche, Alger, Algérie",
    principalPhone: "+213 21 74 32 10",
    status: "ACTIVE",
    tpes: [
      {
        id: 8,
        name: "Verifone",
        models: [
          { id: 15, name: "VX520" },
          { id: 16, name: "VX680" },
        ],
      },
    ],
    subaccounts: [
      {
        id: 12,
        name: "Sara Bensalah",
        email: "sara.bensalah@bna.dz",
        phone: "+213 541 222 333",
        password: "hashed_password_here",
      },
    ],
  },
];





export async function fetchbanks_consts() {
  return new Promise<{ data: { constantBanks: typeof constantBanks } }>((resolve) => {
    setTimeout(() => {
      resolve({ data: { constantBanks } });
    }, 500); // simulate API delay
  });
}

export const fetchbanks = () => fetchbanks_consts();
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

export async function fetchConsumableConstatData() {
  // Fake API response
  return new Promise<{ data: { consumables: { id: number; name: string; quantity: number , reserved: number  }[] } }>(
    (resolve) => {
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
]
          },
        });
      }, 1000);
    }
  );
}


export const fetchConsumables = () =>fetchConsumableConstatData();


export const fetchtpetypes = () => api.get(ENDPOINTS.TPEMODELS);