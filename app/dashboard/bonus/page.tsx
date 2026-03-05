"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function BonusPage() {
  const [bonus, setBonus] = useState<number | null>(null);
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
        .select("balance")
        .eq("user_id", user.id)
        .eq("account_type", "bonus")
        .maybeSingle();
      setBonus(Number(data?.balance ?? 0));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
        <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">My Bonus</h1>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">My Bonus</h1>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Bonus balance is set by support. It will appear here once credited.
      </p>
      <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
        <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Bonus balance</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-gray-500 dark:text-gray-400">$</span>
          <span className="text-2xl font-semibold text-[#141d22] dark:text-gray-100">
            {(bonus ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      {bonus === 0 && (
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          You don&apos;t have any active bonuses yet. Contact support if you expect a bonus.
        </p>
      )}
    </div>
  );
}
