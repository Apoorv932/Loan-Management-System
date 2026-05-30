"use client";

import type { Loan } from "../../types/loan";
import { StatusPill } from "./StatusPill";

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api").replace("/api", "");

export function LoanList({
  loans,
  emptyText,
  renderActions
}: {
  loans: Loan[];
  emptyText: string;
  renderActions?: (loan: Loan) => React.ReactNode;
}) {
  if (!loans.length) {
    return <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">Borrower</th>
            <th className="px-4 py-3">PAN</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Repayment</th>
            <th className="px-4 py-3">Outstanding</th>
            <th className="px-4 py-3">Salary Slip</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loans.map((loan) => (
            <tr key={loan._id}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-950">{loan.userId?.fullName ?? loan.applicationId?.fullName ?? "Borrower"}</p>
                <p className="text-xs text-slate-500">{loan.userId?.email}</p>
              </td>
              <td className="px-4 py-3">{loan.applicationId?.pan ?? "-"}</td>
              <td className="px-4 py-3">{fmt.format(loan.principalAmount)}</td>
              <td className="px-4 py-3">{fmt.format(loan.totalRepayment)}</td>
              <td className="px-4 py-3">{fmt.format(loan.outstandingAmount)}</td>
              <td className="px-4 py-3">
                {loan.applicationId?.salarySlipUrl ? (
                  <a className="text-teal-700 underline text-xs" href={`${BASE_URL}${loan.applicationId.salarySlipUrl}`} rel="noreferrer" target="_blank">
                    View
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3"><StatusPill status={loan.status} /></td>
              <td className="px-4 py-3">{renderActions?.(loan) ?? null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}