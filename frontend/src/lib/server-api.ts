import { cookies } from "next/headers";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ServerFetchOptions extends RequestInit {
  fallback?: any;
}

export async function serverFetch<T = any>(
  endpoint: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const { fallback, ...fetchOptions } = options;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const authToken = cookieStore.get("auth_token")?.value;

    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const res = await axios({
      url,
      method: fetchOptions.method || "GET",
      data: fetchOptions.body,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...fetchOptions.headers as any,
      },
    });

    return res.data as T;
  } catch (error: any) {
    if (fallback !== undefined) {
      return fallback as T;
    }
    const errText = error.response?.data?.message || error.message;
    throw new Error(`Server API request failed: ${errText}`);

    if (fallback !== undefined) {
      return fallback as T;
    }
    throw error;
  }
}
