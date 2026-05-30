import type { Request, Response } from "express";
import { Loan } from "../models/Loan.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { recordPayment } from "../services/payment.service.js";
import { HttpError } from "../utils/httpError.js";
import { paymentSchema, sanctionDecisionSchema } from "../validators/dashboard.validator.js";
import { asyncHandler } from "../utils/asynchandlers.js";

const userSelect = "fullName email role createdAt";
const applicationSelect = "fullName pan monthlySalary employmentMode breStatus salarySlipUrl createdAt";

export const getDashboardSummaryController = asyncHandler(async (_req: Request, res: Response) => {
  const [salesLeads, appliedLoans, sanctionedLoans, disbursedLoans, closedLoans] = await Promise.all([
    User.countDocuments({ role: "BORROWER" }),
    Loan.countDocuments({ status: "APPLIED" }),
    Loan.countDocuments({ status: "SANCTIONED" }),
    Loan.countDocuments({ status: "DISBURSED" }),
    Loan.countDocuments({ status: "CLOSED" })
  ]);

  return res.json({ summary: { salesLeads, appliedLoans, sanctionedLoans, disbursedLoans, closedLoans } });
});

export const getSalesLeadsController = asyncHandler(async (_req: Request, res: Response) => {
  const borrowers = await User.find({ role: "BORROWER" })
    .select(userSelect)
    .sort({ createdAt: -1 })
    .lean();

  const borrowerIds = borrowers.map((b) => b._id);
  const [applications, loans] = await Promise.all([
    LoanApplication.find({ userId: { $in: borrowerIds } }).select(applicationSelect).lean(),
    Loan.find({ userId: { $in: borrowerIds } }).select("userId status createdAt").lean()
  ]);

  const applicationByUserId = new Map(applications.map((a) => [String(a.userId), a]));
  const loanByUserId = new Map(loans.map((l) => [String(l.userId), l]));

  const leads = borrowers
    .map((borrower) => ({
      borrower,
      application: applicationByUserId.get(String(borrower._id)) ?? null,
      loan: loanByUserId.get(String(borrower._id)) ?? null
    }))
    .filter((lead) => !lead.loan);

  return res.json({ leads });
});

export const getSanctionLoansController = asyncHandler(async (_req: Request, res: Response) => {
  const loans = await findLoansByStatus("APPLIED");
  return res.json({ loans });
});

export const approveLoanController = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const input = sanctionDecisionSchema.parse(req.body);
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) throw new HttpError(404, "Loan not found.");
  if (loan.status !== "APPLIED") throw new HttpError(409, "Only applied loans can be sanctioned.");

  loan.status = "SANCTIONED";
  loan.sanctionReason = input.reason;
  loan.rejectionReason = undefined;
  loan.sanctionedBy = userId as never;
  await loan.save();

  return res.json({ message: "Loan sanctioned successfully.", loan: await findLoanById(String(loan._id)) });
});

export const rejectLoanController = asyncHandler(async (req: Request, res: Response) => {
  const input = sanctionDecisionSchema.parse(req.body);
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) throw new HttpError(404, "Loan not found.");
  if (loan.status !== "APPLIED") throw new HttpError(409, "Only applied loans can be rejected.");

  loan.status = "SANCTION_REJECTED";
  loan.rejectionReason = input.reason;
  await loan.save();

  return res.json({ message: "Loan rejected.", loan: await findLoanById(String(loan._id)) });
});

export const getDisbursementLoansController = asyncHandler(async (_req: Request, res: Response) => {
  const loans = await findLoansByStatus("SANCTIONED");
  return res.json({ loans });
});

export const disburseLoanController = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const loan = await Loan.findById(req.params.loanId);

  if (!loan) throw new HttpError(404, "Loan not found.");
  if (loan.status !== "SANCTIONED") throw new HttpError(409, "Only sanctioned loans can be disbursed.");

  loan.status = "DISBURSED";
  loan.disbursedBy = userId as never;
  await loan.save();

  return res.json({ message: "Loan marked as disbursed.", loan: await findLoanById(String(loan._id)) });
});

export const getCollectionLoansController = asyncHandler(async (_req: Request, res: Response) => {
  const loans = await findLoansByStatus("DISBURSED");
  return res.json({ loans });
});

export const recordPaymentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const input = paymentSchema.parse(req.body);

  const result = await recordPayment({
    loanId: getParam(req, "loanId"),
    utrNumber: input.utrNumber,
    amount: input.amount,
    paymentDate: input.paymentDate,
    recordedBy: userId
  });

  const loan = await findLoanById(String(result.loan._id));
  return res.status(201).json({
    message: result.loan.status === "CLOSED" ? "Payment recorded and loan closed." : "Payment recorded.",
    payment: result.payment,
    loan
  });
});

export const getLoanPaymentsController = asyncHandler(async (req: Request, res: Response) => {
  const payments = await Payment.find({ loanId: getParam(req, "loanId") })
    .populate("recordedBy", "fullName email role")
    .sort({ paymentDate: -1, createdAt: -1 });

  return res.json({ payments });
});

function findLoansByStatus(status: "APPLIED" | "SANCTIONED" | "DISBURSED") {
  return Loan.find({ status })
    .populate("userId", userSelect)
    .populate("applicationId", applicationSelect)
    .sort({ createdAt: -1 });
}

function findLoanById(loanId: string) {
  return Loan.findById(loanId)
    .populate("userId", userSelect)
    .populate("applicationId", applicationSelect);
}

function requireUserId(req: Request) {
  if (!req.user?.id) throw new HttpError(401, "Authentication required.");
  return req.user.id;
}

function getParam(req: Request, name: string) {
  const value = req.params[name];
  if (typeof value !== "string") throw new HttpError(400, `Invalid route parameter: ${name}`);
  return value;
}