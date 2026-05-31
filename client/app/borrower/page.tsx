"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFormRequest, apiRequest } from "../../lib/api";
import { getStoredUser } from "../../lib/auth";
import type { AuthUser } from "../../types/user";
import type { EmploymentMode, Loan, LoanApplication, LoanCalculation } from "../../types/loan";

type ApplicationState = {
  application: LoanApplication | null;
  loan: Loan | null;
};

type PersonalDetails = {
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: string;
  employmentMode: EmploymentMode;
};

const initialPersonalDetails: PersonalDetails = {
  fullName: "",
  pan: "",
  dateOfBirth: "",
  monthlySalary: "30000",
  employmentMode: "SALARIED"
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

export default function BorrowerPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(initialPersonalDetails);
  const [salarySlip, setSalarySlip] = useState<File | null>(null);
  const [principalAmount, setPrincipalAmount] = useState(50000);
  const [tenureDays, setTenureDays] = useState(30);
  const [calculation, setCalculation] = useState<LoanCalculation | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = useMemo(() => {
    if (loan) return 4;
    if (application?.salarySlipUrl) return 3;
    if (application?.breStatus === "PASSED") return 2;
    return 1;
  }, [application, loan]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace("/auth/login");
      return;
    }
    if (storedUser.role !== "BORROWER") {
      router.replace("/dashboard");
      return;
    }
    setUser(storedUser);
    void loadApplication();
  }, [router]);

  // Poll every 10s while loan is pending action
  useEffect(() => {
    if (!loan || loan.status === "CLOSED" || loan.status === "SANCTION_REJECTED") return;
    const id = setInterval(() => { void loadApplication(); }, 10000);
    return () => clearInterval(id);
  }, [loan?.status]);

  useEffect(() => {
    setCalculation(calculateLoan(principalAmount, tenureDays));
  }, [principalAmount, tenureDays]);

  async function loadApplication() {
    try {
      const response = await apiRequest<ApplicationState>("/borrower/application");
      setApplication(response.application);
      setLoan(response.loan);
      if (response.application) {
        setPersonalDetails({
          fullName: response.application.fullName ?? "",
          pan: response.application.pan ?? "",
          dateOfBirth: response.application.dateOfBirth?.slice(0, 10) ?? "",
          monthlySalary: String(response.application.monthlySalary ?? 30000),
          employmentMode: response.application.employmentMode ?? "SALARIED"
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load application");
    }
  }

  async function submitPersonalDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ message: string; application: LoanApplication }>(
        "/borrower/personal-details",
        { method: "POST", body: JSON.stringify(personalDetails) }
      );
      setApplication(response.application);
      setNotice(response.message);
    } catch (err) {
      await loadApplication();
      setError(err instanceof Error ? err.message : "Eligibility check failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadSalarySlip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    if (!salarySlip) {
      setError("Choose a salary slip file before uploading.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("salarySlip", salarySlip);
    try {
      const response = await apiFormRequest<{ message: string; application: LoanApplication }>(
        "/borrower/salary-slip",
        formData
      );
      setApplication(response.application);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function applyLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setIsSubmitting(true);
    try {
      // If a loan already exists and is closed, start a new application by resetting state
      if (loan && loan.status === "CLOSED") {
        setLoan(null);
        setApplication(null);
        // The backend endpoint can handle a refresh request; here we simply clear UI state.
        setNotice("Ready for a new application.");
        return;
      }
      const response = await apiRequest<{ message: string; loan: Loan }>("/borrower/loan/apply", {
        method: "POST",
        body: JSON.stringify({ principalAmount, tenureDays })
      });
      setLoan(response.loan);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loan application failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updatePersonalDetails(field: keyof PersonalDetails, value: string) {
    setPersonalDetails((current) => ({ ...current, [field]: value }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSalarySlip(event.target.files?.[0] ?? null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Borrower Portal</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">Loan Application</h1>
        </div>
        <p className="text-sm text-slate-600">{user?.email}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {["Details", "Salary Slip", "Loan Config", "Applied"].map((label, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep >= stepNumber;
          return (
            <div
              className={`rounded-md border px-4 py-3 ${
                isActive ? "border-teal-600 bg-teal-50 text-teal-950" : "border-slate-200 bg-white text-slate-500"
              }`}
              key={label}
            >
              <p className="text-xs font-semibold uppercase">Step {stepNumber}</p>
              <p className="mt-1 font-medium">{label}</p>
            </div>
          );
        })}
      </div>

      {notice ? <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}
      {error ? <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submitPersonalDetails}>
            <h2 className="text-xl font-semibold text-slate-950">Personal details and eligibility</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  onChange={(event) => updatePersonalDetails("fullName", event.target.value)}
                  required
                  value={personalDetails.fullName}
                />
              </Field>
              <Field label="PAN">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2 uppercase"
                  maxLength={10}
                  onChange={(event) => updatePersonalDetails("pan", event.target.value.toUpperCase())}
                  required
                  value={personalDetails.pan}
                />
              </Field>
              <Field label="Date of birth">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  onChange={(event) => updatePersonalDetails("dateOfBirth", event.target.value)}
                  required
                  type="date"
                  value={personalDetails.dateOfBirth}
                />
              </Field>
              <Field label="Monthly salary">
                <input
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  min={0}
                  onChange={(event) => updatePersonalDetails("monthlySalary", event.target.value)}
                  required
                  type="number"
                  value={personalDetails.monthlySalary}
                />
              </Field>
              <Field label="Employment mode">
                <select
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  onChange={(event) => updatePersonalDetails("employmentMode", event.target.value)}
                  value={personalDetails.employmentMode}
                >
                  <option value="SALARIED">Salaried</option>
                  <option value="SELF_EMPLOYED">Self-employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                </select>
              </Field>
            </div>
            {application?.breFailureReasons?.length ? (
              <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                {application.breFailureReasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
              </div>
            ) : null}
            <button
              className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Checking..." : "Run eligibility check"}
            </button>
          </form>

          <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={uploadSalarySlip}>
            <h2 className="text-xl font-semibold text-slate-950">Upload salary slip</h2>
            <p className="mt-1 text-sm text-slate-600">PDF, JPG, or PNG. Maximum file size 5 MB.</p>
            <input
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="mt-5 w-full rounded-md border border-slate-300 px-3 py-2"
              disabled={application?.breStatus !== "PASSED"}
              onChange={handleFileChange}
              type="file"
            />
            {application?.salarySlipUrl ? (
              <p className="mt-3 text-sm text-emerald-700">Salary slip uploaded.</p>
            ) : null}
            <button
              className="mt-5 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting || application?.breStatus !== "PASSED"}
              type="submit"
            >
              {isSubmitting ? "Uploading..." : "Upload salary slip"}
            </button>
          </form>

          <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={applyLoan}>
            <h2 className="text-xl font-semibold text-slate-950">Loan configuration</h2>
            <div className="mt-5 space-y-5">
              <Slider
                label="Loan amount"
                max={500000}
                min={50000}
                onChange={setPrincipalAmount}
                step={5000}
                value={principalAmount}
                valueLabel={currencyFormatter.format(principalAmount)}
              />
              <Slider
                label="Tenure"
                max={365}
                min={30}
                onChange={setTenureDays}
                step={5}
                value={tenureDays}
                valueLabel={`${tenureDays} days`}
              />
            </div>
            <button
              className="mt-5 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={isSubmitting || !application?.salarySlipUrl || (loan && loan.status !== "CLOSED")}
              type="submit"
            >
              {isSubmitting ? "Applying..." : loan ? (loan.status === "CLOSED" ? "New Application" : "Application submitted") : "Apply"}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Calculation</h2>
          <dl className="mt-5 space-y-4">
            <SummaryRow label="Principal" value={currencyFormatter.format(calculation?.principalAmount ?? principalAmount)} />
            <SummaryRow label="Interest rate" value="12% p.a." />
            <SummaryRow label="Tenure" value={`${calculation?.tenureDays ?? tenureDays} days`} />
            <SummaryRow label="Simple interest" value={currencyFormatter.format(calculation?.interestAmount ?? 0)} />
            <SummaryRow label="Total repayment" value={currencyFormatter.format(calculation?.totalRepayment ?? 0)} strong />
          </dl>
          {loan ? (
            <div className={"mt-6 rounded-md px-4 py-3 text-sm " + (
              loan.status === "CLOSED" ? "bg-emerald-50 text-emerald-900" :
              loan.status === "SANCTION_REJECTED" ? "bg-red-50 text-red-900" :
              loan.status === "DISBURSED" ? "bg-teal-50 text-teal-900" :
              loan.status === "SANCTIONED" ? "bg-amber-50 text-amber-900" :
              "bg-sky-50 text-sky-900"
            )}>
              <p className="font-semibold">{loan.status.replaceAll("_", " ")}</p>
              {loan.status === "DISBURSED" && <p className="mt-1 text-xs">Outstanding: {currencyFormatter.format(loan.outstandingAmount)}</p>}
              {loan.status === "CLOSED" && <p className="mt-1 text-xs">Loan fully repaid.</p>}
              {loan.status === "SANCTION_REJECTED" && loan.rejectionReason && <p className="mt-1 text-xs">Reason: {loan.rejectionReason}</p>}
              <p className="mt-1 text-xs opacity-70">Auto-refreshes every 10s</p>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Slider({
  label, min, max, step, value, valueLabel, onChange
}: {
  label: string; min: number; max: number; step: number;
  value: number; valueLabel: string; onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="text-slate-950">{valueLabel}</span>
      </span>
      <input
        className="mt-3 w-full accent-teal-700"
        max={max} min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step} type="range" value={value}
      />
    </label>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={strong ? "font-semibold text-slate-950" : "text-sm font-medium text-slate-900"}>{value}</dd>
    </div>
  );
}

function calculateLoan(principalAmount: number, tenureDays: number): LoanCalculation {
  const interestRate = 12;
  const interestAmount = Number(((principalAmount * interestRate * tenureDays) / (365 * 100)).toFixed(2));
  const totalRepayment = Number((principalAmount + interestAmount).toFixed(2));
  return { principalAmount, tenureDays, interestRate, interestAmount, totalRepayment, outstandingAmount: totalRepayment };
}