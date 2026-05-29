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
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingAmount: number;
  status: "APPLIED" | "SANCTIONED" | "SANCTION_REJECTED" | "DISBURSED" | "CLOSED";
};

export type LoanCalculation = {
  principalAmount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  outstandingAmount: number;
};
