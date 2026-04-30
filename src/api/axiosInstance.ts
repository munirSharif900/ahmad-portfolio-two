import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 5000,
});

// Request — attach token
api.interceptors.request.use((config) => {
  const token = document.cookie.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// Response — on 401 try refresh, else redirect to login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = document.cookie.split("; ").find((c) => c.startsWith("refresh="))?.split("=")[1];
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"}/auth/token/refresh/`,
          { refresh }
        );
        document.cookie = `token=${data.access}; path=/; samesite=lax`;
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        // Refresh failed — clear cookies and redirect to login
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;