import { z } from "zod";

export const questionBlueprintSchema = z.object({
  questionNumber: z.number().int().positive("Question number must be positive"),
  questionText: z.string().min(1, "Question text is required"),
  maxScore: z.number().positive("Score must be greater than 0"),
  modelAnswer: z.string().optional(),
  section: z.string().optional().default("Section A"),
  rubricGuide: z.string().optional(),
});

export const createExamSchema = z
  .object({
    title: z.string().min(3, "Exam title is required (min 3 characters)"),
    subjectId: z.string().min(1, "Subject is required"),
    classId: z.string().min(1, "Class is required"),
    academicYearId: z.string().optional(),
    examDate: z.string().min(1, "Exam date is required"),
    startTime: z.string().default("10:00"),
    endTime: z.string().default("13:00"),
    durationMinutes: z.number().min(15, "Duration must be at least 15 minutes").default(180),
    maxMarks: z.number().min(1, "Max marks must be at least 1").default(100),
    passMarks: z.number().min(1, "Pass marks must be at least 1").default(35),
    examType: z.string().default("MID_TERM"),
    examFee: z.number().min(0).default(250),
    releaseLeadMinutes: z.number().min(0).default(120),
    instructions: z.string().optional(),
    questions: z.array(questionBlueprintSchema).optional(),
  })
  .refine((data) => data.passMarks <= data.maxMarks, {
    message: "Pass marks cannot exceed maximum marks",
    path: ["passMarks"],
  });

export const updateExamSchema = z.object({
  id: z.string().min(1, "Exam ID is required"),
  title: z.string().min(3).optional(),
  durationMinutes: z.number().min(15).optional(),
  maxMarks: z.number().min(1).optional(),
  passMarks: z.number().min(1).optional(),
  instructions: z.string().optional(),
  questions: z.array(questionBlueprintSchema).optional(),
});

export const togglePaperReleaseSchema = z.object({
  paperId: z.string().optional(),
  examId: z.string().optional(),
  release: z.boolean(),
});

export const submitPaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
});

export type QuestionBlueprint = z.infer<typeof questionBlueprintSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type TogglePaperReleaseInput = z.infer<typeof togglePaperReleaseSchema>;
export type SubmitPaperInput = z.infer<typeof submitPaperSchema>;
