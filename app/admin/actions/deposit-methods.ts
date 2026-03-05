"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEPOSIT_METHOD_IDS, type DepositMethodId } from "@/lib/deposit-methods";

export type DepositMethodConfigItem = { method_id: string; enabled: boolean };

/** Get global deposit method config (for all users). Returns defaults if table does not exist yet. */
export async function getGlobalDepositConfig(): Promise<DepositMethodConfigItem[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("deposit_method_config")
    .select("method_id, enabled")
    .eq("scope", "global");
  if (error) {
    if (error.message?.includes("schema cache") || error.message?.includes("does not exist")) {
      return DEPOSIT_METHOD_IDS.map((id) => ({ method_id: id, enabled: true }));
    }
    throw new Error(error.message);
  }
  const map = new Map((data ?? []).map((r) => [r.method_id, r.enabled]));
  return DEPOSIT_METHOD_IDS.map((id) => ({ method_id: id, enabled: map.get(id) ?? true }));
}

/** Set global deposit method config. No-op if table does not exist yet (run migration 011). */
export async function setGlobalDepositConfig(config: DepositMethodConfigItem[]): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error: probe } = await supabase.from("deposit_method_config").select("method_id").limit(1);
  if (probe && (probe.message?.includes("schema cache") || probe.message?.includes("does not exist"))) {
    revalidatePath("/admin/settings");
    return;
  }
  for (const { method_id, enabled } of config) {
    const { data: existing } = await supabase
      .from("deposit_method_config")
      .select("id")
      .eq("scope", "global")
      .eq("method_id", method_id)
      .maybeSingle();
    if (existing && "id" in existing) {
      await supabase.from("deposit_method_config").update({ enabled }).eq("id", existing.id);
    } else {
      await supabase.from("deposit_method_config").insert({ scope: "global", scope_id: null, method_id, enabled });
    }
  }
  revalidatePath("/admin/settings");
}

/** Get effective deposit config for a user: either global or per-user override. Returns defaults if table missing. */
export async function getDepositConfigForUser(userId: string): Promise<{
  useGlobal: boolean;
  methods: DepositMethodConfigItem[];
}> {
  const supabase = createSupabaseAdmin();
  const [globalRes, userRes] = await Promise.all([
    supabase.from("deposit_method_config").select("method_id, enabled").eq("scope", "global"),
    supabase.from("deposit_method_config").select("method_id, enabled").eq("scope", "user").eq("scope_id", userId),
  ]);
  const tableMissing =
    globalRes.error?.message?.includes("schema cache") || globalRes.error?.message?.includes("does not exist") ||
    userRes.error?.message?.includes("schema cache") || userRes.error?.message?.includes("does not exist");
  if (tableMissing) {
    return {
      useGlobal: true,
      methods: DEPOSIT_METHOD_IDS.map((id) => ({ method_id: id, enabled: true })),
    };
  }
  if (globalRes.error) throw new Error(globalRes.error.message);
  if (userRes.error) throw new Error(userRes.error.message);
  const globalMap = new Map((globalRes.data ?? []).map((r) => [r.method_id, r.enabled]));
  const userRows = userRes.data ?? [];
  const useGlobal = userRows.length === 0;
  const methods: DepositMethodConfigItem[] = useGlobal
    ? DEPOSIT_METHOD_IDS.map((id) => ({ method_id: id, enabled: globalMap.get(id) ?? true }))
    : (() => {
        const userMap = new Map(userRows.map((r) => [r.method_id, r.enabled]));
        return DEPOSIT_METHOD_IDS.map((id) => ({ method_id: id, enabled: userMap.get(id) ?? false }));
      })();
  return { useGlobal, methods };
}

/** Set deposit config for one user: useGlobal or custom list. No-op if table does not exist yet. */
export async function setUserDepositConfig(
  userId: string,
  useGlobal: boolean,
  methods?: DepositMethodConfigItem[]
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error: probe } = await supabase.from("deposit_method_config").select("method_id").limit(1);
  if (probe && (probe.message?.includes("schema cache") || probe.message?.includes("does not exist"))) {
    revalidatePath(`/admin/users/${userId}`);
    return;
  }
  await supabase.from("deposit_method_config").delete().eq("scope", "user").eq("scope_id", userId);
  if (!useGlobal && methods) {
    for (const { method_id, enabled } of methods) {
      await supabase.from("deposit_method_config").insert({
        scope: "user",
        scope_id: userId,
        method_id,
        enabled,
      });
    }
  }
  revalidatePath(`/admin/users/${userId}`);
}
