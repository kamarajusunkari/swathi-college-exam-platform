import { z } from "zod";

export const payFeeSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  paymentMethod: z.string().default("UPI_ONLINE"),
});
