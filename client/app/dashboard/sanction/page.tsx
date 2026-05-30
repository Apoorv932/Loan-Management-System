"use client";

import { useEffect, useState } from "react";
import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";
import { DashboardShell } from "../../../components/dashboard/DashboardShell";
import { LoanList } from "../../../components/dashboard/LoanList";
import { apiRequest } from "../../../lib/api";
import type { Loan } from "../../../types/loan";

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reason, setReason] = useState("Reviewed and approved for disbursement.");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLoans() {
    const response = await apiRequest<{ loans: Loan[] }>("/dashboard/sanction");
    setLoans(response.loans);
  }

  useEffect(() => {
    loadLoans().catch((err) => setError(err instanceof Error ? err.message : "Unable to load loans"));
  }, []);

  async function decide(loanId: string, decision: "approve" | "reject") {
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<{ message: string }>(`/dashboard/sanction/${loanId}/${decision}`, {
        method: "POST",
        body: JSON.stringify({ reason })
      });
      setMessage(response.message);
      await loadLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "SANCTION"]}>
      <DashboardShell title="Sanction">
        <ActionMessages error={error} message={message} />
        <label className="mb-4 block max-w-xl">
          <span className="mb-1 block text-sm font-medium text-slate-700">Decision reason</span>
          <input className="w-full rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setReason(event.target.value)} value={reason} />
        </label>
        <LoanList
          emptyText="No applied loans awaiting sanction."
          loans={loans}
          renderActions={(loan) => (
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-medium text-white" onClick={() => decide(loan._id, "approve")}>Approve</button>
              <button className="rounded-md bg-red-700 px-3 py-2 text-xs font-medium text-white" onClick={() => decide(loan._id, "reject")}>Reject</button>
            </div>
          )}
        />
      </DashboardShell>
    </DashboardModuleGuard>
  );
}

function ActionMessages({ error, message }: { error: string; message: string }) {
  return (
    <>
      {message ? <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
    </>
  );
}
