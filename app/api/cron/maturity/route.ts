import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Maturity cron job:
 * 1. Creates maturity_events for users whose plan term (selected_at + term_days) has passed; notifies admin.
 * 2. Auto-approves pending maturity_approvals when expires_at has passed (5 min), crediting profit to user.
 *
 * Call every 1–2 minutes, e.g.:
 *   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.com/api/cron/maturity
 */
// Set CRON_SECRET in env. Example Vercel Cron:
// cron("0 */2 * * *", "/api/cron/maturity")
async function runMaturityJob() {
  const admin = createSupabaseAdmin();
  const created: string[] = [];
  const autoApproved: string[] = [];

  try {
    // ---- Step 1: Create maturity events for due user_plan_selection ----
    const { data: selections } = await admin
      .from("user_plan_selection")
      .select("user_id, plan_id, selected_at, plans(term_days, profit_percentage, minimum_profit)");

    if (!selections?.length) {
      // Step 2 only
    } else {
      type PlanInfo = { term_days: number; profit_percentage: number; minimum_profit: number };
      const toPlan = (p: unknown): PlanInfo | null => {
        if (!p || typeof p !== "object") return null;
        const q = p as Record<string, unknown>;
        const term_days = Number(q.term_days);
        const profit_percentage = Number(q.profit_percentage);
        const minimum_profit = Number(q.minimum_profit);
        if (!Number.isFinite(term_days)) return null;
        return { term_days, profit_percentage: Number.isFinite(profit_percentage) ? profit_percentage : 0, minimum_profit: Number.isFinite(minimum_profit) ? minimum_profit : 0 };
      };
      const now = Date.now();
      const due: { user_id: string; plan_id: string; selected_at: string; plans: PlanInfo }[] = [];
      for (const s of selections as unknown[]) {
        const row = s as { user_id: string; plan_id: string; selected_at: string; plans: unknown };
        const planRaw = Array.isArray(row.plans) ? row.plans[0] : row.plans;
        const plan = toPlan(planRaw);
        if (!plan?.term_days) continue;
        const maturityAt = new Date(row.selected_at).getTime() + plan.term_days * 24 * 60 * 60 * 1000;
        if (maturityAt <= now) due.push({ user_id: row.user_id, plan_id: row.plan_id, selected_at: row.selected_at, plans: plan });
      }

      if (due.length > 0) {
        const { data: existing } = await admin.from("maturity_events").select("user_id, plan_id");
        const existingSet = new Set((existing ?? []).map((e: { user_id: string; plan_id: string }) => `${e.user_id}:${e.plan_id}`));

        for (const s of due) {
          if (existingSet.has(`${s.user_id}:${s.plan_id}`)) continue;
          const plan = s.plans;
          if (!plan) continue;

          const { data: balances } = await admin
            .from("account_balances")
            .select("account_type, balance")
            .eq("user_id", s.user_id);
          const byType = Object.fromEntries((balances ?? []).map((b: { account_type: string; balance: number }) => [b.account_type, Number(b.balance)]));
          const baseAmount = Math.max(0, Number(byType.initial_deposit ?? 0) || Number(byType.spot ?? 0));
          const profit = Math.max(
            baseAmount * (Number(plan.profit_percentage) / 100),
            Number(plan.minimum_profit) ?? 0
          );
          const maturityAmount = baseAmount + profit;

          const { data: event, error: eventErr } = await admin
            .from("maturity_events")
            .insert({
              user_id: s.user_id,
              plan_id: s.plan_id,
              base_amount: baseAmount,
              profit_percentage: plan.profit_percentage,
              term_days: plan.term_days,
              maturity_amount: maturityAmount,
              maturity_reached_at: new Date().toISOString(),
              status: "pending_admin",
            })
            .select("id")
            .single();

          if (eventErr || !event) continue;
          existingSet.add(`${s.user_id}:${s.plan_id}`);
          created.push(event.id);

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          await admin.from("maturity_approvals").insert({
            maturity_event_id: event.id,
            expires_at: expiresAt,
          });

          const { data: profile } = await admin.from("profiles").select("full_name, email").eq("id", s.user_id).single();
          const name = (profile as { full_name?: string; email?: string } | null)?.full_name ?? (profile as { email?: string } | null)?.email ?? s.user_id;
          await admin.from("notifications").insert({
            type: "maturity_pending",
            user_id: s.user_id,
            title: "Maturity pending",
            message: `${name} – plan matured. Amount: ${maturityAmount}. Approve or reject within 5 min.`,
            metadata: { maturity_event_id: event.id, maturity_amount: maturityAmount },
          });
        }
      }
    }

    // ---- Step 2: Auto-approve expired maturity_approvals ----
    const { data: expired } = await admin
      .from("maturity_approvals")
      .select("id, maturity_event_id, edited_amount, maturity_events(user_id, base_amount, maturity_amount)")
      .is("resolution", null)
      .lte("expires_at", new Date().toISOString());

    for (const row of expired ?? []) {
      const r = row as { id: string; maturity_event_id: string; edited_amount: number | null; maturity_events: unknown };
      const meRaw = Array.isArray(r.maturity_events) ? r.maturity_events[0] : r.maturity_events;
      const me = meRaw && typeof meRaw === "object" && meRaw !== null
        ? { user_id: String((meRaw as Record<string, unknown>).user_id), base_amount: Number((meRaw as Record<string, unknown>).base_amount), maturity_amount: Number((meRaw as Record<string, unknown>).maturity_amount) }
        : null;
      const editedAmount = r.edited_amount;
      const amountToUse = editedAmount != null ? editedAmount : me?.maturity_amount;
      const baseAmount = Number(me?.base_amount ?? 0);
      const profitToAdd = Math.max(0, Number(amountToUse ?? 0) - baseAmount);

      const userId = me?.user_id;
      if (!userId) continue;

      const { data: profitRow } = await admin.from("account_balances").select("id, balance").eq("user_id", userId).eq("account_type", "profit").single();
      const newBalance = (Number(profitRow?.balance ?? 0)) + profitToAdd;
      if (profitRow?.id) {
        await admin.from("account_balances").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", profitRow.id);
      } else {
        await admin.from("account_balances").insert({ user_id: userId, account_type: "profit", balance: newBalance });
      }

      await admin.from("maturity_events").update({ status: "auto_approved", applied_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", r.maturity_event_id);
      await admin.from("maturity_approvals").update({ resolution: "auto_approved", resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", r.id);
      autoApproved.push(r.maturity_event_id);
    }
  } catch (e) {
    console.error("Maturity cron error:", e);
    throw e;
  }

  return { ok: true, created: created.length, autoApproved: autoApproved.length, createdIds: created, autoApprovedIds: autoApproved };
}

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const secret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.headers.get("x-cron-secret");
  return !!CRON_SECRET && secret === CRON_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runMaturityJob();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await runMaturityJob();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
