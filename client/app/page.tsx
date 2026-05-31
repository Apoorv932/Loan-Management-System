import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <section className="max-w-lg rounded-xl bg-white/90 backdrop-blur-md shadow-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          Loan Management System
        </p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
          Borrower Portal &amp; Operations Dashboard
        </h1>
        <p className="mt-4 text-base text-gray-600">
          Phase 1 foundation ready with authentication, seeded roles, and protected dashboard access.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="w-full rounded-md bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 sm:w-auto"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="w-full rounded-md border border-indigo-300 px-5 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50 sm:w-auto"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
