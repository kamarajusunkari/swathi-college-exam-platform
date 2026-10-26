import { cookies } from "next/headers";
import { SessionUser } from "./types";
import { cache } from "react";
import { getBackendBaseUrl } from "./server-api";

import axios from "axios";

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const sessionUserEmail = cookieStore.get("swathi_auth_user")?.value;
  const authToken = cookieStore.get("auth_token")?.value || cookieStore.get("access_token")?.value;

  if (!sessionUserEmail && !authToken) {
    return null;
  }

  try {
    const cookieHeader = cookieStore.toString();
    const base = getBackendBaseUrl();
    const url = new URL("auth/me", base.endsWith("/") ? base : `${base}/`).toString();

    const res = await axios.get(url, {
      headers: {
        Cookie: cookieHeader,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    const data = res.data;
    const user = data.user || data;
    if (!user || !user.id) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as SessionUser["role"],
      avatar: user.avatar,
      phone: user.phone,
      permissions: Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === "string"
        ? JSON.parse(user.permissions)
        : [],
      isTimeRestricted: user.isTimeRestricted || false,
      timeWindowStart: user.timeWindowStart || null,
      timeWindowEnd: user.timeWindowEnd || null,
      dailyStartTime: user.dailyStartTime || null,
      dailyEndTime: user.dailyEndTime || null,
      studentProfile: user.studentProfile
        ? {
            id: user.studentProfile.id,
            studentId: user.studentProfile.studentId,
            rollNo: user.studentProfile.rollNo,
            admissionNo: user.studentProfile.admissionNo,
            classId: user.studentProfile.classId,
            className: user.studentProfile.class?.name || user.studentProfile.className,
            sectionName: user.studentProfile.section?.name || user.studentProfile.sectionName,
            groupName: user.studentProfile.group?.name || user.studentProfile.groupName,
            fatherName: user.studentProfile.fatherName,
            dob: user.studentProfile.dob,
          }
        : null,
      teacherProfile: user.teacherProfile
        ? {
            id: user.teacherProfile.id,
            employeeId: user.teacherProfile.employeeId,
            designation: user.teacherProfile.designation,
            qualification: user.teacherProfile.qualification,
            department: user.teacherProfile.department,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch user session from backend API:", error);
    return null;
  }
});

export { checkUserTimeAccess, hasUserPermission } from "./permissions";



