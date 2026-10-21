import { z } from "zod";

// --- Programs ---
export const createProgramSchema = z.object({
  name: z.string().min(2, "Program Name must be at least 2 characters"),
  code: z.string().min(2, "Program Code is required (e.g., BPHARM)"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 year").max(10, "Duration cannot exceed 10 years").default(4),
});

export const updateProgramSchema = z.object({
  name: z.string().min(2, "Program Name must be at least 2 characters").optional(),
  code: z.string().min(2, "Program Code is required").optional(),
  description: z.string().optional(),
  duration: z.number().min(1).max(10).optional(),
});

// --- Classes ---
export const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  code: z.string().min(2, "Class code is required (e.g., BPHARM-SEM-01)"),
  sectionName: z.string().optional(),
  programId: z.string().optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  code: z.string().min(2, "Class code is required"),
});

// --- Sections ---
export const createSectionSchema = z.object({
  name: z.string().min(1, "Section Name is required (e.g., Section A)"),
  classId: z.string().min(1, "Class ID is required"),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1, "Section Name is required"),
});

// --- Bulk Import ---
export const bulkImportClassRowSchema = z.object({
  code: z.string().min(2, "Code is required"),
  name: z.string().min(2, "Name is required"),
  degree: z.string().optional(),
  year: z.number().optional(),
  sem: z.number().optional(),
  sec: z.string().default("Section A"),
  intake: z.number().default(60),
});

export const bulkImportClassesSchema = z.object({
  classes: z.array(bulkImportClassRowSchema).min(1, "At least one class is required for bulk import"),
});

// --- Subjects ---
export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject Name must be at least 2 characters"),
  code: z.string().min(2, "Subject Code is required (e.g. BP101T)"),
  classId: z.string().optional(),
  classIds: z.array(z.string()).optional(),
  maxMarks: z.number().min(1, "Max marks must be greater than 0"),
  passMarks: z.number().min(1, "Pass marks must be greater than 0"),
  credits: z.number().min(1, "Credits must be between 1 and 12").max(12, "Credits cannot exceed 12"),
  teacherId: z.string().optional(),
  sectionId: z.string().optional(),
  perClassTeachers: z.record(z.string()).optional(),
}).refine((data) => data.passMarks <= data.maxMarks, {
  message: "Pass marks cannot exceed maximum marks",
  path: ["passMarks"],
});

export const updateSubjectSchema = z.object({
  id: z.string().min(1, "Subject ID is required"),
  name: z.string().min(2, "Subject Name must be at least 2 characters"),
  code: z.string().min(2, "Subject Code is required"),
  classId: z.string().optional(),
  maxMarks: z.number().min(1, "Max marks must be greater than 0"),
  passMarks: z.number().min(1, "Pass marks must be greater than 0"),
  credits: z.number().min(1).max(12),
  perClassTeachers: z.record(z.string()).optional(),
}).refine((data) => data.passMarks <= data.maxMarks, {
  message: "Pass marks cannot exceed maximum marks",
  path: ["passMarks"],
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

// Type inferences
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type MapSubjectClassesInput = z.infer<typeof mapSubjectClassesSchema>;
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>;
export type BulkImportClassRow = z.infer<typeof bulkImportClassRowSchema>;
