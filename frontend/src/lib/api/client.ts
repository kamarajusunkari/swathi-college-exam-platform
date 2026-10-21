import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

/**
 * Resolves the API base URL.
 * In the browser: uses relative `/api` path (routed to backend service via Vercel rewrites),
 * or NEXT_PUBLIC_API_URL if explicitly specified.
 * On the server: reads the Vercel internal service binding `BACKEND_URL`,
 * or falls back to NEXT_PUBLIC_API_URL / localhost:5000.
 */
export function getClientApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return "/api";
  }
  if (process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.replace(/\/$/, "");
    return `${base}/api`;
  }
  return "http://localhost:5000/api";
}

export const apiClient = axios.create({
  baseURL: getClientApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Attach client-side token if available
    const token = Cookies.get("auth_token");
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorData: any = error.response?.data;
    let message = errorData?.message || errorData?.error;
    if (!message) {
      if (!error.response) {
        message = "Cannot connect to server. Please ensure the backend service is running on port 5000.";
      } else {
        message = error.message || "An unexpected error occurred.";
      }
    }

    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    (customError as any).data = errorData;
    (customError as any).isNetworkError = !error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;
