import type { Request, Response } from "express";
import { Loan } from "../models/Loan.js";
import { LoanApplication } from "../models/LoanApplication.js";
import { calculateLoan } from "../services/loanCalculator.service.js";
import { runBre } from "../services/bre.service.js";
import { HttpError } from "../utils/httpError.js";
import { loanConfigSchema, personalDetailsSchema } from "../validators/borrower.validator.js";

export async function getMyApplicationController(req: Request, res: Response) {
  const userId = req.user?.id;
  const application = await LoanApplication.findOne({ userId });
  const loan = await Loan.findOne({ userId }).sort({ createdAt: -1 });

  return res.json({ application, loan });
}

export async function submitPersonalDetailsController(req: Request, res: Response) {
  const userId = requireUserId(req);
  const input = personalDetailsSchema.parse(req.body);
  const bre = runBre({
    pan: input.pan,
    dateOfBirth: input.dateOfBirth,
    monthlySalary: input.monthlySalary,
    employmentMode: input.employmentMode
  });

  const application = await LoanApplication.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        fullName: input.fullName,
        pan: input.pan,
        dateOfBirth: input.dateOfBirth,
        monthlySalary: input.monthlySalary,
        employmentMode: input.employmentMode,
        breStatus: bre.passed ? "PASSED" : "FAILED",
        breFailureReasons: bre.reasons,
        status: bre.passed ? "READY_TO_APPLY" : "BRE_REJECTED"
      }
    },
    { new: true, upsert: true }
  );

  if (!bre.passed) {
    return res.status(422).json({
      message: "Eligibility check failed.",
      reasons: bre.reasons,
      application
    });
  }

  return res.json({
    message: "Eligibility check passed.",
    application,
    bre
  });
}

export async function uploadSalarySlipController(req: Request, res: Response) {
  const userId = requireUserId(req);
  if (!req.file) {
    throw new HttpError(400, "Salary slip file is required.");
  }

  const application = await LoanApplication.findOne({ userId });
  if (!application || application.breStatus !== "PASSED") {
    throw new HttpError(409, "Complete and pass the eligibility check before uploading salary slip.");
  }

  application.salarySlipUrl = `/uploads/salary-slips/${req.file.filename}`;
  await application.save();

  return res.json({
    message: "Salary slip uploaded successfully.",
    application
  });
}

export async function calculateLoanController(req: Request, res: Response) {
  const input = loanConfigSchema.parse(req.body);
  return res.json({ calculation: calculateLoan(input.principalAmount, input.tenureDays) });
}

export async function applyLoanController(req: Request, res: Response) {
  const userId = requireUserId(req);
  const input = loanConfigSchema.parse(req.body);

  const application = await LoanApplication.findOne({ userId });
  if (!application || application.breStatus !== "PASSED") {
    throw new HttpError(409, "Complete and pass the eligibility check before applying.");
  }

  if (!application.salarySlipUrl) {
    throw new HttpError(409, "Upload salary slip before applying.");
  }

  const existingActiveLoan = await Loan.findOne({
    userId,
    status: { $in: ["APPLIED", "SANCTIONED", "DISBURSED"] }
  });
  if (existingActiveLoan) {
    throw new HttpError(409, "You already have an active loan application.");
  }

  const calculation = calculateLoan(input.principalAmount, input.tenureDays);
  const loan = await Loan.create({
    userId,
    applicationId: application._id,
    ...calculation,
    totalPaid: 0,
    status: "APPLIED"
  });

  return res.status(201).json({
    message: "Loan application submitted successfully.",
    loan
  });
}

function requireUserId(req: Request) {
  if (!req.user?.id) {
    throw new HttpError(401, "Authentication required.");
  }

  return req.user.id;
}
