import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const loanApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, trim: true },
    pan: { type: String, uppercase: true, trim: true },
    dateOfBirth: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: {
      type: String,
      enum: ["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"]
    },
    breStatus: {
      type: String,
      enum: ["NOT_RUN", "PASSED", "FAILED"],
      default: "NOT_RUN"
    },
    breFailureReasons: [{ type: String }],
    salarySlipUrl: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "BRE_REJECTED", "READY_TO_APPLY"],
      default: "DRAFT"
    }
  },
  { timestamps: true }
);

export type LoanApplicationDocument = InferSchemaType<typeof loanApplicationSchema>;

export const LoanApplication: Model<LoanApplicationDocument> =
  mongoose.models.LoanApplication ||
  mongoose.model<LoanApplicationDocument>("LoanApplication", loanApplicationSchema);
