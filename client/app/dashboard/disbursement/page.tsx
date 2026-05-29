import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";

export default function DisbursementPage() {
  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "DISBURSEMENT"]}>
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-950">Disbursement</h1>
        <p className="mt-2 text-slate-600">Phase 3 will implement this module.</p>
      </main>
    </DashboardModuleGuard>
  );
}
