"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const LABELS: Record<string, string> = {
  spot: "Spot Account",
  profit: "Profit Account",
  initial_deposit: "Initial Deposit",
  mining: "Mining Account",
};
const TYPES = ["spot", "profit", "initial_deposit", "mining"] as const;

export default function BalanceCards() {
  const [balances, setBalances] = useState<Record<string, string>>({
    spot: "0",
    profit: "0",
    initial_deposit: "0",
    mining: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("account_balances")
        .select("account_type, balance")
        .eq("user_id", user.id);
      const next: Record<string, string> = { spot: "0", profit: "0", initial_deposit: "0", mining: "0" };
      for (const row of data ?? []) {
        if (TYPES.includes(row.account_type as (typeof TYPES)[number])) {
          next[row.account_type] = String(Number(row.balance));
        }
      }
      setBalances(next);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TYPES.map((key) => (
          <div
            key={key}
            className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-slate-900"
          >
            <div className="text-xs font-semibold text-gray-500">{LABELS[key]}</div>
            <div className="mt-4 text-xs text-gray-400">Available Balance</div>
            <div className="mt-1 text-xl font-semibold text-[#141d22] dark:text-gray-100">…</div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {TYPES.map((key) => (
        <div
          key={key}
          className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-slate-900"
        >
          <div className="text-xs font-semibold text-gray-500">{LABELS[key]}</div>
          <div className="mt-4 text-xs text-gray-400">Available Balance</div>
          <div className="mt-1 text-xl font-semibold text-[#141d22] dark:text-gray-100">
            ${Number(balances[key]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </section>
  );
}
