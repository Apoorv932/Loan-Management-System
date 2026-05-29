"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "../../lib/auth";
import type { AuthUser } from "../../types/user";

const modules = [
  { href: "/dashboard/sales", label: "Sales", roles: ["ADMIN", "SALES"] },
  { href: "/dashboard/sanction", label: "Sanction", roles: ["ADMIN", "SANCTION"] },
  { href: "/dashboard/disbursement", label: "Disbursement", roles: ["ADMIN", "DISBURSEMENT"] },
  { href: "/dashboard/collection", label: "Collection", roles: ["ADMIN", "COLLECTION"] }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.replace("/auth/login");
      return;
    }
    if (storedUser.role === "BORROWER") {
      router.replace("/borrower");
      return;
    }
    setUser(storedUser);
  }, [router]);

  const visibleModules = user ? modules.filter((module) => module.roles.includes(user.role)) : [];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-slate-950">Operations Dashboard</h1>
      <p className="mt-2 text-slate-600">Role: {user?.role ?? "Checking..."}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {visibleModules.map((module) => (
          <Link className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" href={module.href} key={module.href}>
            <h2 className="font-semibold text-slate-950">{module.label}</h2>
            <p className="mt-2 text-sm text-slate-600">Phase 3 will add operational workflows.</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
