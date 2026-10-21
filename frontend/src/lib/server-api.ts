import { cookies } from "next/headers";
import axios from "axios";

/**
 * Resolves the backend API base URL for server-side calls.
 * Reads the Vercel internal service binding `BACKEND_URL` when deployed in Vercel Services,
 * falls back to `NEXT_PUBLIC_API_URL` or local dev port 5000.
 */
export function getBackendBaseUrl(): string {
  if (process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.replace(/\/$/, "");
    return `${base}/api`;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
}

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

    const base = getBackendBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = new URL(cleanEndpoint, base.endsWith("/") ? base : `${base}/`).toString();

    const res = await axios({
      url,
      method: fetchOptions.method || "GET",
      data: fetchOptions.body,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(fetchOptions.headers as any),
      },
    });

    return res.data as T;
  } catch (error: any) {
    if (fallback !== undefined) {
      return fallback as T;
    }
    const errText = error.response?.data?.message || error.message;
    throw new Error(`Server API request failed: ${errText}`);
  }
}
