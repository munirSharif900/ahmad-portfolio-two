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

export interface UsersResponse {
  results: RoleUserAPI[];
  count: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
}

export const getAllUsers = async (params?: { search?: string; role?: string; page?: number; page_size?: number }): Promise<UsersResponse> => {
  const res = await api.get(API_ENDPOINTS.ROLES.GET_ALL, { params });
  const data = res.data;
  // Normalize: handle both flat array and paginated object responses
  if (Array.isArray(data)) {
    return { results: data, count: data.length, page_size: data.length, total_count: data.length, total_pages: 1, has_next: false };
  }
  return {
    results: Array.isArray(data.results) ? data.results : [],
    count: data.count ?? 0,
    page_size: data.page_size ?? 10,
    total_count: data.total_count ?? data.count ?? 0,
    total_pages: data.total_pages ?? 1,
    has_next: data.has_next ?? false,
  };
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
