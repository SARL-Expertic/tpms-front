import { updateconsumableitem } from "./tickets";

export const ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  TICKETS: "/api/bank-employee/ticket",
  NETWORK_CHECK: "/api/bank-employee/ticket/network-check",
  INTERVENTION: "/api/bank-employee/ticket/intervention",
  TPE: "api/bank-employee/terminal-type",
  DEBLOCKING: "/api/bank-employee/ticket/deblocking-order",

  NETWORK_CHECKACCOUNT_MANAGER: "/api/account-manager/ticket/network-check",
  INTERVENTIONACCOUNT_MANAGER: "/api/account-manager/ticket/intervention",
  DEBLOCKINGACCOUNT_MANAGER: "/api/account-manager/ticket/deblocking-order",
  CONSUMABLEACCOUNT_MANAGER: "/api/account-manager/ticket/consumable",

  CLIENTS: "/api/bank-employee/client",
  CONSUMABLE: "/api/bank-employee/ticket/consumable",
  USER: "/api/bank-employee/user",
  USERAccountManager: "/api/account-manager/user",
  TICKETS_MANAGER: "/api/account-manager/ticket",
  TPES_MANAGER: "/api/account-manager/tpe",
  CLIENTS_MANAGER: "/api/account-manager/client",
  BANKS: "/api/account-manager/bank",
  TPEMODELS: "/api/account-manager/tpe",
  CLOSETICKET: "/api/account-manager/ticket/close",
  TERMINALTYPES: "/api/account-manager/terminal-type",
  createmanfacturer: "/api/account-manager/terminal-type/manufacturer",
  CREATEMODEL: "/api/account-manager/terminal-type/model",

  CONSUMABLEITEMS: "/api/account-manager/consumableItem",

    CONSUMABLEITEMS_Bankemployee: "/api/bank-employee/consumableItem",

  CREATEBANK: "/api/account-manager/bank",
  UPDATEBANK: "/api/account-manager/bank",

  UPDATENETWORKCHECKTICKET: "/api/account-manager/ticket/network-check",
  UPDATEINTERVENTIONTICKET: "/api/account-manager/ticket/intervention",
  UPDATECONSUMABLETICKET: "/api/account-manager/ticket/consumable",
  UPDATEDEBLOCKINGTICKET: "/api/account-manager/ticket/deblocking-order",

USER_ME: "/auth/me"

};
