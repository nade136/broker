"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type TransferRow = {
  id: string;
  type: string;
  amount: number;
  status: string;
  note: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  credit: "Credit",
  debit: "Debit",
  bonus: "Bonus",
};

export default function TransactionsPage() {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("transfer_history")
      .select("id, type, amount, status, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setRows((data ?? []) as TransferRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  async function handleClearHistory() {
    if (!confirm("Clear all your transaction history? This cannot be undone.")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setClearing(true);
    setError(null);
    const { error: err } = await supabase.from("transfer_history").delete().eq("user_id", user.id);
    if (err) {
      setError(err.message);
      setClearing(false);
      return;
    }
    setRows([]);
    setClearing(false);
  }

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
            Transactions
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Deposit and withdrawal history. Approved deposits appear here.
          </p>
        </div>
        {rows.length > 0 && (
          <button
            type="button"
            disabled={clearing}
            onClick={handleClearHistory}
            className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            {clearing ? "Clearing…" : "Clear history"}
          </button>
        )}
      </div>
      {error && (
        <p className="mb-4 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {loading ? (
        <p className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No transactions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium dark:bg-slate-700">
                  {TYPE_LABELS[r.type] ?? r.type}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  ${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                {r.note && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{r.note}</span>
                )}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
