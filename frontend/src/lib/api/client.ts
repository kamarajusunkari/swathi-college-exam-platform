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
    let message: string | undefined;

    if (errorData) {
      if (typeof errorData.message === "string") {
        message = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        message = errorData.message
          .map((m: any) => (typeof m === "string" ? m : JSON.stringify(m)))
          .join(", ");
      } else if (typeof errorData.error === "string") {
        message = errorData.error;
      } else if (typeof errorData.error === "object" && errorData.error !== null) {
        message =
          errorData.error.message ||
          errorData.error.code ||
          JSON.stringify(errorData.error);
      } else if (typeof errorData === "string") {
        message = errorData.length > 250 ? `${errorData.slice(0, 250)}...` : errorData;
      } else if (typeof errorData === "object") {
        message = errorData.detail || errorData.title || JSON.stringify(errorData);
      }
    }

    if (!message || message === "[object Object]") {
      if (!error.response) {
        const attemptedUrl = error.config
          ? `${error.config.baseURL || ""}${error.config.url || ""}`
          : "unknown";
        message = `Cannot connect to backend server at [${attemptedUrl}]. Please check NEXT_PUBLIC_API_URL.`;
        console.error(`[API Network Error] Failed to reach: ${attemptedUrl}`, error);
      } else if (error.response.status === 401) {
        message = "Invalid email or password.";
      } else if (error.response.status === 404) {
        message = `API route not found (404) at ${error.config?.url || "backend"}. Please check NEXT_PUBLIC_API_URL.`;
      } else if (error.response.status === 502 || error.response.status === 503) {
        message = "Backend server is currently down or unreachable (502/503).";
      } else {
        message = error.message || `Request failed with status ${error.response.status}`;
      }
    }

    const customError = new Error(String(message));
    (customError as any).status = error.response?.status;
    (customError as any).data = errorData;
    (customError as any).isNetworkError = !error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;
