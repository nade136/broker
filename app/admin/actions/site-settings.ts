"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MIN_WITHDRAWAL_KEY = "min_withdrawal_usd";

/** Get minimum withdrawal amount (USD) for display in admin Settings. */
export async function getMinWithdrawal(): Promise<string> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", MIN_WITHDRAWAL_KEY)
    .maybeSingle();
  if (error) return "0";
  return (data?.value ?? "0").trim() || "0";
}

/** Set minimum withdrawal amount (USD). No-op if site_settings table does not exist yet. */
export async function setMinWithdrawal(value: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const normalized = value.trim() === "" ? "0" : String(Math.max(0, parseFloat(value) || 0));
  const { error } = await supabase.from("site_settings").upsert(
    { key: MIN_WITHDRAWAL_KEY, value: normalized, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
  if (!error) revalidatePath("/admin/settings");
}
