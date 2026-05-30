"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DashboardModuleGuard } from "../../../components/dashboard/DashboardModuleGuard";
import { DashboardShell } from "../../../components/dashboard/DashboardShell";
import { LoanList } from "../../../components/dashboard/LoanList";
import { apiRequest } from "../../../lib/api";
import type { Loan, Payment } from "../../../types/loan";

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLoans() {
    const response = await apiRequest<{ loans: Loan[] }>("/dashboard/collection");
    setLoans(response.loans);
  }

  useEffect(() => {
    loadLoans().catch((err) => setError(err instanceof Error ? err.message : "Unable to load loans"));
  }, []);

  async function selectLoan(loan: Loan) {
    setSelectedLoan(loan);
    setAmount(String(loan.outstandingAmount));
    setUtrNumber("");
    setMessage("");
    setError("");
    try {
      const res = await apiRequest<{ payments: Payment[] }>(`/dashboard/collection/${loan._id}/payments`);
      setPayments(res.payments);
    } catch {
      setPayments([]);
    }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLoan) return;
    setError("");
    setMessage("");
    try {
      const response = await apiRequest<{ message: string; loan: Loan }>(
        `/dashboard/collection/${selectedLoan._id}/payments`,
        { method: "POST", body: JSON.stringify({ utrNumber, amount, paymentDate }) }
      );
      setMessage(response.message);
      setSelectedLoan(null);
      setPayments([]);
      setUtrNumber("");
      setAmount("");
      await loadLoans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  }

  const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

  return (
    <DashboardModuleGuard allowedRoles={["ADMIN", "COLLECTION"]}>
      <DashboardShell title="Collection">
        {message ? <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <LoanList
          emptyText="No active disbursed loans for collection."
          loans={loans}
          renderActions={(loan) => (
            <button className="rounded-md bg-teal-700 px-3 py-2 text-xs font-medium text-white" onClick={() => selectLoan(loan)}>
              Record payment
            </button>
          )}
        />

        {selectedLoan ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form className="rounded-md border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submitPayment}>
              <h2 className="text-xl font-semibold text-slate-950">Record payment</h2>
              <p className="mt-1 text-sm text-slate-600">
                Borrower: <span className="font-medium">{selectedLoan.userId?.fullName}</span> &nbsp;|&nbsp; Outstanding: <span className="font-medium">{fmt.format(selectedLoan.outstandingAmount)}</span>
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">UTR number</span>
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2 uppercase" onChange={(e) => setUtrNumber(e.target.value.toUpperCase())} required value={utrNumber} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Amount</span>
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" max={selectedLoan.outstandingAmount} min={1} onChange={(e) => setAmount(e.target.value)} required type="number" value={amount} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Payment date</span>
                  <input className="w-full rounded-md border border-slate-300 px-3 py-2" onChange={(e) => setPaymentDate(e.target.value)} required type="date" value={paymentDate} />
                </label>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white" type="submit">Save payment</button>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" onClick={() => { setSelectedLoan(null); setPayments([]); }} type="button">Cancel</button>
              </div>
            </form>

            <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Payment history</h2>
              {payments.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No payments recorded yet.</p>
              ) : (
                <table className="mt-4 min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-4">UTR</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="py-2 pr-4 font-mono text-xs">{p.utrNumber}</td>
                        <td className="py-2 pr-4">{fmt.format(p.amount)}</td>
                        <td className="py-2">{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : null}
      </DashboardShell>
    </DashboardModuleGuard>
  );
}