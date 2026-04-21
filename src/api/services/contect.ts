import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export const sendContactMessage = async (name: string, email: string, subject: string, message: string) => {
  const response = await api.post(API_ENDPOINTS.CONTACT.SEND, { name, email, subject, message });
  return response.data;
};


export const receiveContactQueries = async () => {
  const response = await api.get(API_ENDPOINTS.CONTACT.GET_ALL + "?page_size=50");
  return response.data;
};

export const markContactRead = async (id: number) => {
  const response = await api.post(API_ENDPOINTS.CONTACT.MARK_READ(id));
  return response.data;
};

export const markAllContactRead = async () => {
  const response = await api.post(API_ENDPOINTS.CONTACT.MARK_ALLREAD);
  return response.data;
};

export const deleteContactQuery = async (id: number) => {
  try {
    await api.delete(API_ENDPOINTS.CONTACT.DELETE(id));
  } catch (error: any) {
    const msg = error?.response?.data?.detail || error?.response?.data?.message || `Server error: ${error?.response?.status}`;
    throw new Error(msg);
  }
};
