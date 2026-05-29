import type { AuthUser, Role } from "../types/user";

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const dashboardModuleByRole: Record<Exclude<Role, "BORROWER">, string> = {
  ADMIN: "/dashboard",
  SALES: "/dashboard/sales",
  SANCTION: "/dashboard/sanction",
  DISBURSEMENT: "/dashboard/disbursement",
  COLLECTION: "/dashboard/collection"
};

export function storeAuth(response: AuthResponse) {
  window.localStorage.setItem("lms_token", response.token);
  window.localStorage.setItem("lms_user", JSON.stringify(response.user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("lms_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function clearAuth() {
  window.localStorage.removeItem("lms_token");
  window.localStorage.removeItem("lms_user");
}
