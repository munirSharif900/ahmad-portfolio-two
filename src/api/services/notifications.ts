import api from "../axiosInstance";
import { API_ENDPOINTS } from "../endpoints";

export const getNotifications = async () => {
  const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_ALL + "?page_size=50");
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT);
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  const res = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALLREAD);
  return res.data;
};

export const deleteNotificationApi = async (id: number) => {
  await api.delete(`/notifications/${id}/`);
};
