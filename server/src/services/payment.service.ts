import { Loan } from "../models/Loan.js";
import { Payment } from "../models/Payment.js";
import { HttpError } from "../utils/httpError.js";

export async function recordPayment(input: {
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  recordedBy: string;
}) {
  const loan = await Loan.findById(input.loanId);
  if (!loan) {
    throw new HttpError(404, "Loan not found.");
  }

  if (loan.status !== "DISBURSED") {
    throw new HttpError(409, "Payments can only be recorded for disbursed loans.");
  }

  if (input.amount > loan.outstandingAmount) {
    throw new HttpError(400, "Payment amount cannot exceed outstanding balance.");
  }

  const existingPayment = await Payment.findOne({ utrNumber: input.utrNumber });
  if (existingPayment) {
    throw new HttpError(409, "UTR number already exists.");
  }

  const payment = await Payment.create({
    loanId: loan._id,
    userId: loan.userId,
    utrNumber: input.utrNumber,
    amount: input.amount,
    paymentDate: input.paymentDate,
    recordedBy: input.recordedBy
  });

  loan.totalPaid = Number((loan.totalPaid + input.amount).toFixed(2));
  loan.outstandingAmount = Number((loan.totalRepayment - loan.totalPaid).toFixed(2));

  if (loan.outstandingAmount < 1) {
    loan.outstandingAmount = 0;
    loan.status = "CLOSED";
    loan.closedAt = new Date();
  }

  await loan.save();

  return { payment, loan };
}
