import { z } from "zod";

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "EXAM_PAPER_CREATOR",
  "EXAM_PAPER_EVALUATOR",
  "EXAM_PAPER_CHECKER",
  "TEACHER",
  "STUDENT",
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Username, institutional email, or roll number is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const switchRoleSchema = z.object({
  role: UserRoleSchema,
});

export type SwitchRoleFormData = z.infer<typeof switchRoleSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isTimeRestricted: z.boolean().default(false),
  timeWindowStart: z.string().nullable().optional(),
  timeWindowEnd: z.string().nullable().optional(),
  dailyStartTime: z.string().nullable().optional(),
  dailyEndTime: z.string().nullable().optional(),
  studentProfile: z.any().nullable().optional(),
  teacherProfile: z.any().nullable().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const loginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  token: z.string().optional(),
  user: userProfileSchema.optional(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
