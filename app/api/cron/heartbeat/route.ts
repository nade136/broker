import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Lightweight Supabase touch so the project sees periodic activity (optional).
 * This is NOT user impersonation or malware — it is a single read via the service role,
 * same pattern as /api/cron/maturity. Protect with CRON_SECRET.
 *
 * Schedule externally (daily is enough), e.g.:
 *   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.com/api/cron/heartbeat
 *
 * Vercel: add cron in vercel.json (see repo root) and set CRON_SECRET in project env.
 */
function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.headers.get("x-cron-secret");
  return !!CRON_SECRET && secret === CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createSupabaseAdmin();
    const { error } = await admin.from("profiles").select("id").limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
    }
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
