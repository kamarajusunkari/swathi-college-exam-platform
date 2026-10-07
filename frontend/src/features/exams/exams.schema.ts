import { z } from "zod";

export const createExamSchema = z.object({
  title: z.string().min(3, "Exam title is required (min 3 characters)"),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  academicYearId: z.string().min(1, "Academic Year is required"),
  examDate: z.string().min(1, "Exam date is required"),
  startTime: z.string().default("10:00"),
  endTime: z.string().default("13:00"),
  durationMinutes: z.number().min(15).default(180),
  maxMarks: z.number().min(1).default(100),
  passMarks: z.number().min(1).default(35),
  examType: z.string().default("MID_TERM"),
  examFee: z.number().min(0).default(250),
  releaseLeadMinutes: z.number().min(0).default(120),
  questions: z.array(
    z.object({
      questionNumber: z.number().int().positive(),
      questionText: z.string().min(1, "Question text required"),
      maxScore: z.number().positive(),
      modelAnswer: z.string().optional(),
      section: z.string().optional(),
      rubricGuide: z.string().optional(),
    })
  ).optional(),
});

export type CreateExamFormData = z.infer<typeof createExamSchema>;
