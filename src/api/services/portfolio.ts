import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface PortfolioAPI {
  id: number;
  title: string;
  github_url: string;
  live_url: string;
  description: string;
  category: "Full-Stack" | "Frontend" | "Backend";
  status: "live" | "in progress" | "archived";
  tech_stack: string;
  year: string;
  image?: string;
  created_at?: string;
}

export interface PortfolioPayload {
  title: string;
  github_url: string;
  live_url: string;
  description: string;
  category: string;
  status: string;
  tech_stack: string;
  year: string;
}

export const getAllPortfolio = async (params?: { status?: string; category?: string; search?: string; page?: number; page_size?: number }) => {
  const res = await api.get(API_ENDPOINTS.PORTFOLIO.GET_ALL, { params });
  return res.data;
};

export const createPortfolio = async (payload: PortfolioPayload) => {
  const res = await api.post(API_ENDPOINTS.PORTFOLIO.CREATE, payload);
  return res.data;
};

export const updatePortfolio = async (id: number, payload: Partial<PortfolioPayload>, imageFile?: File) => {
  if (imageFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
    form.append("image", imageFile);
    const res = await api.patch(API_ENDPOINTS.PORTFOLIO.UPDATE(id), form);
    return res.data;
  }
  const res = await api.patch(API_ENDPOINTS.PORTFOLIO.UPDATE(id), payload);
  return res.data;
};

export const createPortfolioWithImage = async (payload: PortfolioPayload, imageFile?: File) => {
  if (imageFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
    form.append("image", imageFile);
    const res = await api.post(API_ENDPOINTS.PORTFOLIO.CREATE, form);
    return res.data;
  }
  const res = await api.post(API_ENDPOINTS.PORTFOLIO.CREATE, payload);
  return res.data;
};

export const deletePortfolio = async (id: number) => {
  await api.delete(API_ENDPOINTS.PORTFOLIO.DELETE(id));
};
