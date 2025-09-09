import api from './axios';
import { ENDPOINTS } from './endpoints';

export const login = (data: { email: string; password: string }) =>
 api.post(ENDPOINTS.LOGIN, data);

export const register = (data: { email: string; password: string; role: string }) =>
  api.post(ENDPOINTS.REGISTER, data);

export const getCurrentUser = () =>
  api.get(ENDPOINTS.USER);
