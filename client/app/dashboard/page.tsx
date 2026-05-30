"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardModuleGuard } from "../../components/dashboard/DashboardModuleGuard";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import { apiRequest } from "../../lib/api";
import { dashboardModuleByRole, getStoredUser } from "../../lib/auth";

type Summary = {
  salesLeads: number;
  appliedLoans: number;
  sanctionedLoans: number;
  disbursedLoans: number;
  closedLoans: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (user.role === "BORROWER") {
      router.replace("/borrower");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace(dashboardModuleByRole[user.role]);
      return;
    }

    apiRequest<{ summary: Summary }>("/dashboard/summary")
      .then((response) => setSummary(response.summary))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load dashboard"));
  }, [router]);

  return (
    <DashboardModuleGuard allowedRoles={["ADMIN"]}>
      <DashboardShell title="Overview">
        {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Sales Leads" value={summary?.salesLeads} />
          <Metric label="Applied" value={summary?.appliedLoans} />
          <Metric label="Sanctioned" value={summary?.sanctionedLoans} />
          <Metric label="Disbursed" value={summary?.disbursedLoans} />
          <Metric label="Closed" value={summary?.closedLoans} />
        </div>
      </DashboardShell>
    </DashboardModuleGuard>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value ?? "-"}</p>
    </div>
  );
}
