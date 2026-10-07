import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Deterministic date formatter across SSR and Client to prevent React hydration mismatches.
 * Returns formatted string like "23 Sep 2026".
 */
export function formatDate(date: string | Date | number | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Deterministic time formatter (e.g. "10:30 AM")
 */
export function formatTime(date: string | Date | number | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

/**
 * Deterministic date-time formatter (e.g. "23 Sep 2026, 10:30 AM")
 */
export function formatDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return "—";
  return `${formatDate(date)}, ${formatTime(date)}`;
}

/**
 * Deterministic currency formatter (e.g. "₹25,000")
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "₹0";
  const num = Number(amount);
  return `₹${num.toLocaleString("en-IN")}`;
}

