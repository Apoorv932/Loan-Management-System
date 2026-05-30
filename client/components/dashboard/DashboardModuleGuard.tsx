"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardModuleByRole, getStoredUser } from "../../lib/auth";
import type { AuthUser, Role } from "../../types/user";

type DashboardModuleGuardProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export function DashboardModuleGuard({ allowedRoles, children }: DashboardModuleGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const allowedRoleKey = allowedRoles.join(",");

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

    if (!allowedRoles.includes(storedUser.role)) {
      router.replace(dashboardModuleByRole[storedUser.role]);
      return;
    }

    setUser(storedUser);
  }, [allowedRoleKey, router]);

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <p className="text-slate-600">Checking access...</p>
      </main>
    );
  }

  return children;
}