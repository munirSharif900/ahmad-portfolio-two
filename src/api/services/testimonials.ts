import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export interface TestimonialAPI {
  id: number;
  name: string;
  role: string;
  company: string;
  rating: number;
  review_text: string;
  status: "Published" | "Hidden";
  created_at?: string;
}

export interface TestimonialPayload {
  name: string;
  role: string;
  company: string;
  rating: number;
  review_text: string;
  status: "Published" | "Hidden";
}

export const getAllTestimonials = async (params?: { status?: string; search?: string; page?: number }) => {
  const res = await api.get(API_ENDPOINTS.TESTIMONIAL.GET_ALL, { params });
  return res.data;
};

export const createTestimonial = async (payload: TestimonialPayload) => {
  const res = await api.post(API_ENDPOINTS.TESTIMONIAL.CREATE, payload);
  return res.data;
};

export const updateTestimonial = async (id: number, payload: Partial<TestimonialPayload>) => {
  const res = await api.patch(API_ENDPOINTS.TESTIMONIAL.UPDATE(id), payload);
  return res.data;
};

export const deleteTestimonial = async (id: number) => {
  await api.delete(API_ENDPOINTS.TESTIMONIAL.DELETE(id));
};
