import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    const message =
      errorData?.message ||
      errorData?.error ||
      error.message ||
      "An unexpected network error occurred.";

    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    (customError as any).data = errorData;
    (customError as any).isNetworkError = !error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;
