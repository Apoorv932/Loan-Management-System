import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Loan Management System</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Borrower portal and operations dashboard</h1>
        <p className="mt-4 text-lg text-slate-600">
          Phase 1 foundation is ready for authentication, seeded roles, and protected dashboard access.
        </p>
        <div className="mt-8 flex gap-3">
          <Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/auth/login">
            Login
          </Link>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" href="/auth/signup">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
