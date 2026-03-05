"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ACCOUNT_TYPES } from "./constants";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    await resend.emails.send({ from, to, subject, html });
    return true;
  } catch {
    return false;
  }
}

export type AdminUserMessage = {
  id: string;
  user_id: string;
  from_admin: boolean;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function updateAdminProfile(
  userId: string,
  data: { firstname?: string; lastname?: string; email?: string; address?: string; status?: string }
) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("profiles").update(data).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateAdminBalances(
  userId: string,
  balances: { spot: string; profit: string; initial_deposit: string; mining: string; bonus: string }
) {
  const supabase = createSupabaseAdmin();
  for (const key of ACCOUNT_TYPES) {
    const value = parseFloat(String(balances[key]).replace(/,/g, "")) || 0;
    await supabase.from("account_balances").upsert(
      { user_id: userId, account_type: key, balance: value },
      { onConflict: "user_id,account_type" }
    );
  }
  revalidatePath(`/admin/users/${userId}`);
}

/** Clear all transfer history for a user (admin only). Balances are unchanged. */
export async function clearTransferHistoryForUser(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("transfer_history").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/users/${userId}`);
}

// ---- Admin–user messages ----

export async function getAdminUserMessages(userId: string): Promise<AdminUserMessage[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_user_messages")
    .select("id, user_id, from_admin, body, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminUserMessage[];
}

export async function sendAdminMessage(userId: string, body: string): Promise<void> {
  if (!body?.trim()) throw new Error("Message is required.");
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_user_messages").insert({
    user_id: userId,
    from_admin: true,
    body: body.trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/users/${userId}`);

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();
  const email = (profile as { email?: string } | null)?.email;
  if (email) {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const messagesUrl = `${appUrl}/dashboard/messages`;
    const trimmed = body.trim();
    const preview = trimmed.slice(0, 120) + (trimmed.length > 120 ? "…" : "");
    const safePreview = preview.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
    await sendEmail(
      email,
      "You have a new message from Web support",
      `<p>Support sent you a message:</p><p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${safePreview}</p><p><a href="${messagesUrl}">View and reply in Messages</a></p>`
    );
  }
}

export async function markAdminUserMessagesRead(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  await supabase
    .from("admin_user_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("from_admin", false)
    .is("read_at", null);
  revalidatePath(`/admin/users/${userId}`);
}

export async function clearAdminUserMessages(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_user_messages").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/users/${userId}`);
}

// ---- Withdrawal method config (user dashboard Withdraw shows only these) ----

export type WithdrawalMethodConfigItem = { method_id: string; enabled: boolean };

export async function getWithdrawalConfigForUser(userId: string): Promise<{ methods: WithdrawalMethodConfigItem[] }> {
  const supabase = createSupabaseAdmin();
  const { data: userRows, error: userErr } = await supabase
    .from("withdrawal_method_config")
    .select("method_id, enabled")
    .eq("scope", "user")
    .eq("scope_id", userId);
  if (userErr && (userErr.message?.includes("schema cache") || userErr.message?.includes("does not exist")))
    return { methods: [{ method_id: "bank", enabled: true }, { method_id: "crypto", enabled: true }, { method_id: "paypal", enabled: true }, { method_id: "cashapp", enabled: true }] };
  if (userRows?.length) {
    const methods = ["bank", "crypto", "paypal", "cashapp"].map((method_id) => {
      const row = userRows.find((r: { method_id: string }) => r.method_id === method_id);
      return { method_id, enabled: row ? (row as { enabled: boolean }).enabled : true };
    });
    return { methods };
  }
  const { data: globalRows, error: globalErr } = await supabase
    .from("withdrawal_method_config")
    .select("method_id, enabled")
    .eq("scope", "global");
  if (globalErr) return { methods: [{ method_id: "bank", enabled: true }, { method_id: "crypto", enabled: true }, { method_id: "paypal", enabled: true }, { method_id: "cashapp", enabled: true }] };
  const methods = ["bank", "crypto", "paypal", "cashapp"].map((method_id) => {
    const row = globalRows?.find((r: { method_id: string }) => r.method_id === method_id);
    return { method_id, enabled: row ? (row as { enabled: boolean }).enabled : true };
  });
  return { methods };
}

export async function setWithdrawalConfigForUser(
  userId: string,
  methods: { method_id: string; enabled: boolean }[]
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error: delErr } = await supabase.from("withdrawal_method_config").delete().eq("scope", "user").eq("scope_id", userId);
  if (delErr && (delErr.message?.includes("schema cache") || delErr.message?.includes("does not exist"))) return;
  for (const m of methods) {
    const { error: insErr } = await supabase.from("withdrawal_method_config").insert({
      scope: "user",
      scope_id: userId,
      method_id: m.method_id,
      enabled: m.enabled,
    });
    if (insErr && (insErr.message?.includes("schema cache") || insErr.message?.includes("does not exist"))) break;
  }
  revalidatePath(`/admin/users/${userId}`);
}

// ---- Withdrawal options (multiple bank / paypal / cashapp per user; crypto uses user_crypto_addresses) ----

export type WithdrawalOptionRow = { id: string; method_id: string; detail: string };

export async function getWithdrawalOptionsForUser(userId: string): Promise<WithdrawalOptionRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_withdrawal_options")
    .select("id, method_id, detail")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as WithdrawalOptionRow[];
}

export async function setWithdrawalOptionsForUser(
  userId: string,
  options: { method_id: string; detail: string }[]
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error: delError } = await supabase.from("user_withdrawal_options").delete().eq("user_id", userId);
  if (delError && (delError.message?.includes("schema cache") || delError.message?.includes("does not exist")))
    return;
  for (const o of options) {
    if (!o.detail?.trim()) continue;
    await supabase.from("user_withdrawal_options").insert({
      user_id: userId,
      method_id: o.method_id,
      detail: o.detail.trim(),
    });
  }
  revalidatePath(`/admin/users/${userId}`);
}

// ---- Crypto addresses (user sees on Deposit page) ----

export type CryptoAddressRow = { id: string; coin: string; address: string };

export async function getCryptoAddressesForUser(userId: string): Promise<CryptoAddressRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_crypto_addresses")
    .select("id, coin, address")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as CryptoAddressRow[];
}

export async function setCryptoAddressesForUser(
  userId: string,
  addresses: { id?: string; coin: string; address: string }[]
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error: delError } = await supabase.from("user_crypto_addresses").delete().eq("user_id", userId);
  if (delError && (delError.message?.includes("schema cache") || delError.message?.includes("does not exist")))
    return;
  for (const a of addresses) {
    if (!a.coin.trim() && !a.address.trim()) continue;
    const { error: insError } = await supabase.from("user_crypto_addresses").insert({
      user_id: userId,
      coin: a.coin.trim() || "Wallet",
      address: a.address.trim(),
    });
    if (insError) break;
  }
  revalidatePath(`/admin/users/${userId}`);
}
