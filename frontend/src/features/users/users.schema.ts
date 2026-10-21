import { z } from "zod";

export const OnboardingTypeSchema = z.enum(["admin", "teacher", "student"]);
export type OnboardingType = z.infer<typeof OnboardingTypeSchema>;

export const onboardUserSchema = z.object({
  type: OnboardingTypeSchema,
  name: z.string().trim().min(2, "Full Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid institutional email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  // Admin / Staff fields
  role: z.string().optional(),
  designation: z.string().optional(),
  isTimeRestricted: z.boolean().default(false),
  timeWindowStart: z.string().nullable().optional(),
  timeWindowEnd: z.string().nullable().optional(),
  dailyStartTime: z.string().nullable().optional(),
  dailyEndTime: z.string().nullable().optional(),
  // Teacher fields
  employeeId: z.string().optional(),
  department: z.string().optional(),
  qualification: z.string().optional(),
  // Student fields
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

export type OnboardUserInput = z.infer<typeof onboardUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.string().min(1, "Role is required"),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isTimeRestricted: z.boolean().default(false),
  timeWindowStart: z.string().nullable().optional(),
  timeWindowEnd: z.string().nullable().optional(),
  dailyStartTime: z.string().nullable().optional(),
  dailyEndTime: z.string().nullable().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const userFilterSchema = z.object({
  search: z.string().default(""),
  role: z.string().default("ALL"),
  classId: z.string().default("ALL"),
  sortBy: z.enum(["name", "roll", "date"]).default("name"),
});

export type UserFilterInput = z.infer<typeof userFilterSchema>;
