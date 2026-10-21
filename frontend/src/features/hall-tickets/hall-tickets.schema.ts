import { z } from "zod";

export const verifyHallTicketSchema = z.object({
  ticketNumber: z.string().min(1, "Hall ticket barcode/number is required"),
});

export const hallTicketSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  examId: z.string(),
  academicYearId: z.string().nullable().optional(),
  hallTicketNumber: z.string(),
  qrCodeData: z.string(),
  centerName: z.string().default("Main Campus Exam Center"),
  roomNo: z.string().default("Hall 1"),
  seatNo: z.string().default("A-01"),
  status: z.enum(["ACTIVE", "REVOKED", "HELD"]).default("ACTIVE"),
  createdAt: z.string().optional(),
});

export type VerifyHallTicketInput = z.infer<typeof verifyHallTicketSchema>;
export type HallTicket = z.infer<typeof hallTicketSchema>;
