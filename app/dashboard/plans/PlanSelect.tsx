"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Plan = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  profit_percentage: number;
  term_days: number;
};

export default function PlanSelect({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSelection = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_plan_selection")
        .select("plan_id")
        .eq("user_id", user.id)
        .single();
      if (data?.plan_id) setSelectedId(data.plan_id);
    };
    loadSelection();
  }, []);

  async function handleSelect(planId: string) {
    setSelectedId(planId);
    setStatus("saving");
    setMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Please log in to select a plan.");
        setStatus("error");
        return;
      }
      const { error } = await supabase
        .from("user_plan_selection")
        .upsert({ user_id: user.id, plan_id: planId, selected_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      setStatus("done");
      setMessage("Plan saved. Taking you to deposit…");
      router.push(`/dashboard/deposit?plan=${encodeURIComponent(planId)}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No plans available right now. Check back later.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <button
          key={plan.id}
          type="button"
          onClick={() => handleSelect(plan.id)}
          className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-xs transition-colors ${
            selectedId === plan.id
              ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
              : "border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          }`}
        >
          <div>
            <div className="font-semibold">{plan.title}</div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              {plan.description || "—"}
            </div>
            {(plan.profit_percentage > 0 || plan.term_days > 0) && (
              <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                {plan.profit_percentage}% profit · {plan.term_days} days
              </div>
            )}
          </div>
          <span className="text-lg text-gray-400">→</span>
        </button>
      ))}
      {message && (
        <p
          className={`text-xs ${
            status === "error" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
