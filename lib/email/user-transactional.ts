import { sendTransactionalEmail } from "./resend";

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function escapeHtmlEmail(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Greeting line from profile name or email. */
export function safeUserGreeting(fullName: string | null | undefined, email: string | null | undefined): string {
  const raw = (fullName?.trim() || email?.trim() || "there").split(/\s+/)[0] || "there";
  return escapeHtmlEmail(raw);
}

export function userEmailWrap(innerHtml: string, greetingFirstName: string): string {
  const base = appBaseUrl();
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#0f172a;max-width:560px;">
      <p>Hi ${greetingFirstName},</p>
      ${innerHtml}
      <p style="margin-top:28px;font-size:13px;color:#64748b;">
        <a href="${base}/dashboard" style="color:#0d9488;">Open your dashboard</a>
      </p>
    </div>
  `;
}

/** Fire-and-forget; logs a warning if Resend fails (missing key, etc.). */
export async function notifyUserByEmail(
  to: string | null | undefined,
  subject: string,
  html: string
): Promise<void> {
  const email = to?.trim();
  if (!email) return;
  const result = await sendTransactionalEmail(email, subject, html);
  if (!result.ok) {
    console.warn("[notifyUserByEmail]", subject, result);
  }
}
