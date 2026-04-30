import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface ServiceAPI {
  id: number;
  title: string;
  description: string;
  features: string;
  color_gradient: string;
  visible: boolean;
  created_at?: string;
}

export interface ServicePayload {
  title: string;
  description: string;
  features: string;
  color_gradient: string;
  visible: boolean;
}

export const getAllServices = async (params?: { search?: string; page?: number; page_size?: number }) => {
  const res = await api.get(API_ENDPOINTS.SERVICES.GET_ALL, { params });
  return res.data;
};

export const createService = async (payload: ServicePayload) => {
  const res = await api.post(API_ENDPOINTS.SERVICES.CREATE, payload);
  return res.data;
};

export const updateService = async (id: number, payload: Partial<ServicePayload>) => {
  const res = await api.patch(API_ENDPOINTS.SERVICES.UPDATE(id), payload);
  return res.data;
};

export const deleteService = async (id: number) => {
  await api.delete(API_ENDPOINTS.SERVICES.DELETE(id));
};
