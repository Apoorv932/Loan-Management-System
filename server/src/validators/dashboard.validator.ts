import { z } from "zod";

export const sanctionDecisionSchema = z.object({
  reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(500)
});

export const paymentSchema = z.object({
  utrNumber: z.string().trim().min(4, "UTR number is required").max(80).transform((value) => value.toUpperCase()),
  amount: z.coerce.number().positive("Payment amount must be positive"),
  paymentDate: z.coerce.date()
});
