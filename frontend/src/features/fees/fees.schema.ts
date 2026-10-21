import { z } from "zod";

export const payFeeSchema = z
  .object({
    paymentId: z.string().optional(),
    examId: z.string().optional(),
    paymentMethod: z.string().default("UPI_INSTANT"),
    amount: z.number().positive().optional(),
  })
  .refine((data) => Boolean(data.paymentId || data.examId), {
    message: "Either payment ID or exam ID is required to process fee payment",
    path: ["paymentId"],
  });

export const feePaymentRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  examId: z.string(),
  amount: z.number(),
  status: z.enum(["PAID", "UNPAID", "PENDING", "DUE"]),
  paymentMethod: z.string().nullable().optional(),
  receiptNo: z.string().nullable().optional(),
  transactionId: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export type PayFeeInput = z.infer<typeof payFeeSchema>;
export type FeePaymentRecord = z.infer<typeof feePaymentRecordSchema>;
