import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const loanSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "LoanApplication", required: true },
    principalAmount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true, default: 12 },
    interestAmount: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    totalPaid: { type: Number, required: true, default: 0 },
    outstandingAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["APPLIED", "SANCTIONED", "SANCTION_REJECTED", "DISBURSED", "CLOSED"],
      default: "APPLIED",
      index: true
    },
    sanctionReason: { type: String },
    rejectionReason: { type: String },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    closedAt: { type: Date }
  },
  { timestamps: true }
);

export type LoanDocument = InferSchemaType<typeof loanSchema>;

export const Loan: Model<LoanDocument> =
  mongoose.models.Loan || mongoose.model<LoanDocument>("Loan", loanSchema);
