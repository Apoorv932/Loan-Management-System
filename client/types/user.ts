export type Role = "ADMIN" | "SALES" | "SANCTION" | "DISBURSEMENT" | "COLLECTION" | "BORROWER";

export type AuthUser = {
  id: string;
  fullName?: string;
  email: string;
  role: Role;
};
