import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  code: z.string().min(2, "Class code is required"),
  sectionName: z.string().optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject Name must be at least 2 characters"),
  code: z.string().min(2, "Subject Code is required"),
  classId: z.string().optional(),
  classIds: z.array(z.string()).optional(),
  maxMarks: z.number().min(1, "Max marks must be positive"),
  passMarks: z.number().min(1, "Pass marks must be positive"),
  credits: z.number().min(1).max(12),
  teacherId: z.string().optional(),
  sectionId: z.string().optional(),
});

export const mapSubjectClassesSchema = z.object({
  sourceSubjectId: z.string().min(1, "Source subject is required"),
  targetClassIds: z.array(z.string()).min(1, "Select at least one class"),
  copyTeacher: z.boolean().optional(),
  perClassTeachers: z.record(z.string()).optional(),
});

export const assignTeacherSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
});
