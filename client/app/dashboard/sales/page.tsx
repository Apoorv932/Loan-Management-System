"use client";

import { useEffect, useState } from "react";
import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";
import { DashboardShell } from "../../../components/dashboard/DashboardShell";
import { StatusPill } from "../../../components/dashboard/StatusPill";
import { apiRequest } from "../../../lib/api";
import type { SalesLead } from "../../../types/loan";

export default function SalesPage() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ leads: SalesLead[] }>("/dashboard/sales")
      .then((response) => setLeads(response.leads))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load leads"));
  }, []);

  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "SALES"]}>
      <DashboardShell title="Sales">
        {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {!leads.length ? (
          <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">No pre-application leads right now.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Borrower</th>
                  <th className="px-4 py-3">PAN</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">BRE</th>
                  <th className="px-4 py-3">Salary Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.borrower._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{lead.borrower.fullName}</p>
                      <p className="text-xs text-slate-500">{lead.borrower.email}</p>
                    </td>
                    <td className="px-4 py-3">{lead.application?.pan ?? "-"}</td>
                    <td className="px-4 py-3">{lead.application?.monthlySalary ?? "-"}</td>
                    <td className="px-4 py-3"><StatusPill status={lead.application?.breStatus ?? "NOT_RUN"} /></td>
                    <td className="px-4 py-3">{lead.application?.salarySlipUrl ? "Uploaded" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardShell>
    </DashboardModuleGuard>
  );
}
