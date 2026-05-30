const styles: Record<string, string> = {
  APPLIED: "bg-sky-50 text-sky-800",
  SANCTIONED: "bg-amber-50 text-amber-800",
  SANCTION_REJECTED: "bg-red-50 text-red-800",
  DISBURSED: "bg-teal-50 text-teal-800",
  CLOSED: "bg-emerald-50 text-emerald-800",
  PASSED: "bg-emerald-50 text-emerald-800",
  FAILED: "bg-red-50 text-red-800",
  NOT_RUN: "bg-slate-100 text-slate-700"
};

export function StatusPill({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
