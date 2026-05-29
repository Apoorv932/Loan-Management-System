import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const paymentSchema = new Schema(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;

export const Payment: Model<PaymentDocument> =
  mongoose.models.Payment || mongoose.model<PaymentDocument>("Payment", paymentSchema);
