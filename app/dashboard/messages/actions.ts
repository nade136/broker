"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UserMessageRow = {
  id: string;
  user_id: string;
  from_admin: boolean;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function getMessagesForUser(userId: string): Promise<UserMessageRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_user_messages")
    .select("id, user_id, from_admin, body, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as UserMessageRow[];
}

export async function sendUserMessage(userId: string, body: string): Promise<void> {
  if (!body?.trim()) throw new Error("Message is required.");
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_user_messages").insert({
    user_id: userId,
    from_admin: false,
    body: body.trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/messages");
}

export async function markAdminMessagesReadByUser(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  await supabase
    .from("admin_user_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("from_admin", true)
    .is("read_at", null);
  revalidatePath("/dashboard/messages");
}

export async function clearMessagesForUser(userId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_user_messages").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/messages");
}
