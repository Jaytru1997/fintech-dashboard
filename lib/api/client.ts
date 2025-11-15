import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || "An error occurred";

      if (status === 401) {
        // Only clear auth if we have a token (to avoid clearing during initial hydration)
        const authState = useAuthStore.getState();
        if (authState.token) {
          // Unauthorized - clear auth and redirect to login
          authState.clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }
          toast.error("Session expired. Please login again.");
        }
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default api;

