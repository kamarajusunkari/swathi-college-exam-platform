import { z } from "zod";

export const onboardUserSchema = z.object({
  type: z.enum(["admin", "teacher", "student"]),
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  email: z.string().email("Invalid institutional email address"),
  phone: z.string().optional(),
  password: z.string().optional(),
  role: z.string().optional(),
  designation: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  qualification: z.string().optional(),
  rollNo: z.string().optional(),
  studentId: z.string().optional(),
  admissionNo: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  academicYearId: z.string().optional(),
  fatherName: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isTimeRestricted: z.boolean().optional(),
  timeWindowStart: z.string().nullable().optional(),
  timeWindowEnd: z.string().nullable().optional(),
  dailyStartTime: z.string().nullable().optional(),
  dailyEndTime: z.string().nullable().optional(),
});
