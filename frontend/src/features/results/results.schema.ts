import { z } from "zod";

export const publishResultSchema = z.object({
  examId: z.string().min(1, "Exam ID is required"),
  publish: z.boolean().default(true),
});
