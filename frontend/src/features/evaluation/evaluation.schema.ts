import { z } from "zod";

export const submitEvaluationSchema = z.object({
  answerSheetId: z.string().min(1, "Answer sheet ID is required"),
  overallRemarks: z.string().optional(),
  evaluations: z.array(
    z.object({
      questionNumber: z.number().int().positive(),
      marksAwarded: z.number().min(0, "Marks cannot be negative"),
      maxMarks: z.number().min(0),
      remarks: z.string().optional(),
    })
  ),
});

export const checkModerationSchema = z.object({
  answerSheetId: z.string().min(1, "Answer sheet ID is required"),
  adjustedScore: z.number().optional(),
  checkerNotes: z.string().optional(),
  questionAdjustments: z.array(
    z.object({
      questionNumber: z.number(),
      adjustedMarks: z.number(),
      remarks: z.string().optional(),
    })
  ).optional(),
});
