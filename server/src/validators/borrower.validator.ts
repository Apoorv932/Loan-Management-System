import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  pan: z.string().trim().transform((value) => value.toUpperCase()),
  dateOfBirth: z.coerce.date(),
  monthlySalary: z.coerce.number().positive("Monthly salary must be positive"),
  employmentMode: z.enum(["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"])
});

export const loanConfigSchema = z.object({
  principalAmount: z.coerce
    .number()
    .min(50000, "Loan amount must be at least Rs. 50,000")
    .max(500000, "Loan amount cannot exceed Rs. 5,00,000"),
  tenureDays: z.coerce
    .number()
    .int()
    .min(30, "Tenure must be at least 30 days")
    .max(365, "Tenure cannot exceed 365 days")
});
