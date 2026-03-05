import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import PlanSelect from "./PlanSelect";

export const metadata: Metadata = {
  title: "Plans",
};

export default async function PlansPage() {
  const supabase = createSupabaseAdmin();
  const { data: plans } = await supabase
    .from("plans")
    .select("id, title, description, type, profit_percentage, term_days")
    .eq("visible", true)
    .order("created_at", { ascending: true });

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Select a plan
      </h1>
      <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        We have a variety of plan options to suit our vast majority of clients.
      </p>
      <PlanSelect plans={plans ?? []} />
    </div>
  );
}
