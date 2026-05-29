import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";

export default function CollectionPage() {
  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "COLLECTION"]}>
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-slate-950">Collection</h1>
        <p className="mt-2 text-slate-600">Phase 3 will implement this module.</p>
      </main>
    </DashboardModuleGuard>
  );
}
