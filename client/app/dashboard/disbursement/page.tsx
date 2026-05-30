"use client";

import { useEffect, useState } from "react";
import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";
import { DashboardShell } from "../../../components/dashboard/DashboardShell";
import { LoanList } from "../../../components/dashboard/LoanList";
import { apiRequest } from "../../../lib/api";
import type { Loan } from "../../../types/loan";

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLoans() {
    const response = await apiRequest<{ loans: Loan[] }>("/dashboard/disbursement");
    setLoans(response.loans);
  }

  useEffect(() => {
    loadLoans().catch((err) => setError(err instanceof Error ? err.message : "Unable to load loans"));
  }, []);

  async function disburse(loanId: string) {
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<{ message: string }>(`/dashboard/disbursement/${loanId}/disburse`, {
        method: "POST"
      });
      setMessage(response.message);
      await loadLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "DISBURSEMENT"]}>
      <DashboardShell title="Disbursement">
        {message ? <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <LoanList
          emptyText="No sanctioned loans awaiting disbursement."
          loans={loans}
          renderActions={(loan) => (
            <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-medium text-white" onClick={() => disburse(loan._id)}>Mark disbursed</button>
          )}
        />
      </DashboardShell>
    </DashboardModuleGuard>
  );
}
