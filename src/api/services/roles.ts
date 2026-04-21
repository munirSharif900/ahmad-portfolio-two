import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface RoleUserAPI {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
}

export const getAllUsers = async () => {
  const res = await api.get(API_ENDPOINTS.ROLES.GET_ALL);
  return res.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const res = await api.post(API_ENDPOINTS.ROLES.CREATE, payload);
  return res.data;
};

export const updateUser = async (id: number, payload: Partial<CreateUserPayload>) => {
  const res = await api.patch(API_ENDPOINTS.ROLES.UPDATE(id), payload);
  return res.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(API_ENDPOINTS.ROLES.DELETE(id));
};

export const revokeUser = async (id: number) => {
  const res = await api.post(API_ENDPOINTS.ROLES.REVOKE(id));
  return res.data;
};
