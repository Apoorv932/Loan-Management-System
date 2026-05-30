export type EmploymentMode = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";

export type LoanApplication = {
  _id: string;
  fullName?: string;
  pan?: string;
  dateOfBirth?: string;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  breStatus: "NOT_RUN" | "PASSED" | "FAILED";
  breFailureReasons: string[];
  salarySlipUrl?: string;
  status: "DRAFT" | "BRE_REJECTED" | "READY_TO_APPLY";
};

export type Loan = {
  _id: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  };
  applicationId?: LoanApplication;
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingAmount: number;
  status: "APPLIED" | "SANCTIONED" | "SANCTION_REJECTED" | "DISBURSED" | "CLOSED";
  sanctionReason?: string;
  rejectionReason?: string;
  closedAt?: string;
  createdAt?: string;
};

export type Payment = {
  _id: string;
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  recordedBy?: {
    fullName: string;
    email: string;
    role: string;
  };
};

export type SalesLead = {
  borrower: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
  };
  application: LoanApplication | null;
  loan: Loan | null;
};

export type LoanCalculation = {
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  outstandingAmount: number;
};
