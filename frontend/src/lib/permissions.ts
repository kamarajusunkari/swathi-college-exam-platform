import { SessionUser } from "./types";

/**
 * Checks whether the current user is within their permitted time window.
 * Super Admins are always unrestricted.
 * This is client-safe (no server dependencies).
 */
export function checkUserTimeAccess(user: SessionUser | null): {
  isAllowed: boolean;
  status: "ACTIVE" | "EXPIRED" | "NOT_STARTED" | "OUTSIDE_HOURS" | "UNRESTRICTED";
  message: string;
} {
  if (!user) {
    return { isAllowed: false, status: "EXPIRED", message: "Not authenticated" };
  }

  // Super Admin & Admin have full institutional operational clearance
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return { isAllowed: true, status: "UNRESTRICTED", message: "Unrestricted master access" };
  }

  if (!user.isTimeRestricted) {
    return { isAllowed: true, status: "UNRESTRICTED", message: "Open access schedule" };
  }

  const now = new Date();

  // 1. Date Range Check (validFrom -> validUntil)
  if (user.timeWindowStart && new Date(user.timeWindowStart) > now) {
    return {
      isAllowed: false,
      status: "NOT_STARTED",
      message: `Access window starts on ${new Date(user.timeWindowStart).toLocaleDateString("en-IN")}`,
    };
  }

  if (user.timeWindowEnd && new Date(user.timeWindowEnd) < now) {
    return {
      isAllowed: false,
      status: "EXPIRED",
      message: `Access window expired on ${new Date(user.timeWindowEnd).toLocaleDateString("en-IN")}`,
    };
  }

  // 2. Daily Operational Hours Check (dailyStartTime e.g. "09:00", dailyEndTime e.g. "18:00")
  if (user.dailyStartTime && user.dailyEndTime) {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const [startH, startM] = user.dailyStartTime.split(":").map(Number);
    const [endH, endM] = user.dailyEndTime.split(":").map(Number);
    const startTotalMin = startH * 60 + (startM || 0);
    const endTotalMin = endH * 60 + (endM || 0);

    if (currentTotalMin < startTotalMin || currentTotalMin > endTotalMin) {
      return {
        isAllowed: false,
        status: "OUTSIDE_HOURS",
        message: `Active operational hours are ${user.dailyStartTime} to ${user.dailyEndTime} IST. Current time is outside authorized window.`,
      };
    }
  }

  return { isAllowed: true, status: "ACTIVE", message: "Active authorized window" };
}

/**
 * Checks if user has a specific permission taking role, permissions list, and time windows into account.
 */
export function hasUserPermission(user: SessionUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;

  const timeCheck = checkUserTimeAccess(user);
  if (!timeCheck.isAllowed) return false;

  // Role Defaults
  if (user.role === "EXAM_PAPER_CREATOR") {
    if (["CREATE_MAIN_PAPER", "APPROVE_MAIN_PAPER"].includes(permission)) return true;
  }
  if (user.role === "EXAM_PAPER_EVALUATOR") {
    if (["EVALUATE_MAIN_SHEETS"].includes(permission)) return true;
  }
  if (user.role === "EXAM_PAPER_CHECKER") {
    if (["CHECK_MAIN_SHEETS", "FINALIZE_MAIN_MARKS"].includes(permission)) return true;
  }
  if (user.role === "TEACHER") {
    if (["CREATE_INTERNAL_PAPER", "EVALUATE_INTERNAL_MARKS"].includes(permission)) return true;
  }

  return user.permissions?.includes(permission) || false;
}
