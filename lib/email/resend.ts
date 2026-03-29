import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function getAdminNotificationEmail(): Promise<string | null> {
  const envAdmin = process.env.ADMIN_EMAIL?.trim();
  if (envAdmin) return envAdmin;

  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.email?.trim() ?? null;
}

export type SendEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_api_key" | "resend_error" | "exception"; detail?: string };

export async function sendTransactionalEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) return { ok: false, reason: "missing_api_key" };
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { ok: false, reason: "resend_error", detail: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: "exception",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Short line for control UI / flash messages */
export function describeSendEmailResult(r: SendEmailResult): string {
  if (r.ok) return "Email sent successfully.";
  if (r.reason === "missing_api_key") return "Email not sent: add RESEND_API_KEY to environment.";
  if (r.detail) return `Email not sent: ${r.detail}`;
  return "Email not sent.";
}
