"use client";

import Link from "next/link";
import { clearAuth, getStoredUser } from "../../lib/auth";

const navItems = [
  { href: "/dashboard", label: "Overview", roles: ["ADMIN"] },
  { href: "/dashboard/sales", label: "Sales", roles: ["ADMIN", "SALES"] },
  { href: "/dashboard/sanction", label: "Sanction", roles: ["ADMIN", "SANCTION"] },
  { href: "/dashboard/disbursement", label: "Disbursement", roles: ["ADMIN", "DISBURSEMENT"] },
  { href: "/dashboard/collection", label: "Collection", roles: ["ADMIN", "COLLECTION"] }
];

export function DashboardShell({ children, title }: { children: React.ReactNode; title: string }) {
  const user = getStoredUser();
  const visibleItems = user ? navItems.filter((item) => item.roles.includes(user.role)) : [];

  function logout() {
    clearAuth();
    window.location.href = "/auth/login";
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Operations Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{user?.email} · {user?.role}</p>
        </div>
        <button className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" onClick={logout}>
          Logout
        </button>
      </header>
      <nav className="mt-5 flex flex-wrap gap-2">
        {visibleItems.map((item) => (
          <Link className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </main>
  );
}
