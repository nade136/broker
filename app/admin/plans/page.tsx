import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import PlansManager from "./PlansManager";

export const metadata: Metadata = {
  title: "Plans",
};

export default async function AdminPlansPage() {
  const supabase = createSupabaseAdmin();
  const { data: plans } = await supabase
    .from("plans")
    .select("id, type, title, description, visible, profit_percentage, minimum_profit, term_days, deposit_amount")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Plans
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Manage trading and mining plans. These appear on the user dashboard under Plans. Set profit %, minimum profit, and term days for maturity.
        </p>
      </div>

      <PlansManager plans={plans ?? []} />
    </div>
  );
}
