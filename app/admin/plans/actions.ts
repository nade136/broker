"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PlanType = "trading" | "mining";

export type PlanInput = {
  type: PlanType;
  title: string;
  description: string;
  visible: boolean;
  profit_percentage: number;
  minimum_profit: number;
  term_days: number;
  deposit_amount: number;
};

export async function createPlan(input: PlanInput) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("plans").insert({
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim() || null,
    visible: input.visible ?? true,
    profit_percentage: Number(input.profit_percentage) || 0,
    minimum_profit: Number(input.minimum_profit) || 0,
    term_days: Math.max(1, Math.floor(Number(input.term_days)) || 30),
    deposit_amount: Math.max(0, Number(input.deposit_amount) || 0),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}

export async function updatePlan(
  id: string,
  input: Partial<PlanInput>
) {
  const supabase = createSupabaseAdmin();
  const payload: Record<string, unknown> = {};
  if (input.type != null) payload.type = input.type;
  if (input.title != null) payload.title = input.title.trim();
  if (input.description != null) payload.description = input.description.trim() || null;
  if (input.visible != null) payload.visible = input.visible;
  if (input.profit_percentage != null) payload.profit_percentage = Number(input.profit_percentage) || 0;
  if (input.minimum_profit != null) payload.minimum_profit = Number(input.minimum_profit) || 0;
  if (input.term_days != null) payload.term_days = Math.max(1, Math.floor(Number(input.term_days)) || 30);
  if (input.deposit_amount != null) payload.deposit_amount = Math.max(0, Number(input.deposit_amount) || 0);

  const { error } = await supabase.from("plans").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}

export async function togglePlanVisibility(id: string) {
  const supabase = createSupabaseAdmin();
  const { data: plan } = await supabase.from("plans").select("visible").eq("id", id).single();
  if (!plan) throw new Error("Plan not found");
  const { error } = await supabase.from("plans").update({ visible: !plan.visible }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}

export async function deletePlan(id: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
}
