# Trading Subscription – Suggestions (No Implementation)

You asked how "Trading subscription" in the admin dashboard could connect to plans on the user dashboard. Here are professional options that fit your current system (Plans, user_plan_selection, account_balances, maturity).

---

## Option A: Trading subscription = plan subscription (recommended)

**Idea:** "Trading subscription" is the **subscription state** of a user to a plan, not a separate product.

- **Admin:** No separate "Trading subscription" CRUD. Admin keeps managing **Plans** (create/edit plans with profit %, term, etc.). Optionally in **Admin → Users → [user]** you show "Subscribed plan" (from `user_plan_selection`) and "Subscription started at" (e.g. when first deposit was approved for that plan).
- **User:** User selects a plan on **Dashboard → Plans** (already done). That selection is their "trading subscription". Maturity job and balances work as now.
- **Flow:** Plan selection → Deposit → Admin approves → User’s account is credited and they are effectively "subscribed" to that plan until term ends (maturity).

**Pros:** Uses existing Plans + user_plan_selection; no new admin UI; clear meaning.  
**Cons:** "Trading subscription" is just a label for "user’s current plan".

---

## Option B: Trading subscription as a product tier above plans

**Idea:** Introduce a **subscription tier** (e.g. Basic / Pro / VIP) that groups or unlocks plans.

- **Admin:** New section "Trading subscriptions" where admin creates tiers (e.g. "Starter", "Pro"). Each tier has a name, description, and **linked plan(s)** (many-to-many or one plan per tier). Optionally price or duration.
- **User:** On **Dashboard → Plans** (or a "Trading subscriptions" page), user picks a **tier** instead of a single plan. Picking "Pro" subscribes them to the linked plan(s). Rest of flow (deposit, maturity) stays the same.
- **DB:** e.g. `trading_subscription_tiers` (id, name, description, created_at), `tier_plans` (tier_id, plan_id). `user_plan_selection` could become `user_subscription` (user_id, tier_id or plan_id, started_at).

**Pros:** Good for upselling (tiers); admin can bundle plans.  
**Cons:** More schema and UI; need clear rules (one plan per user vs multiple).

---

## Option C: Trading subscription = recurring subscription to a plan

**Idea:** User doesn’t just "select a plan once" but has an explicit **recurring subscription** (e.g. monthly) that renews.

- **Admin:** "Trading subscriptions" = list of **active subscriptions** (user + plan + status + current period end). Admin can see who is subscribed, cancel, or extend. Plans stay as now (profit %, term).
- **User:** After selecting a plan and completing first deposit, they get a "subscription" that runs for the plan term. When term ends (maturity), you can auto-renew or prompt to deposit again; renewal could create a new maturity cycle.
- **DB:** e.g. `plan_subscriptions` (user_id, plan_id, status, period_start, period_end, created_at). Maturity job already uses user_plan_selection + term_days; you could derive period_end from selected_at + term_days or store it in this table.

**Pros:** Clear audit trail of who is "subscribed" and until when; supports renewals.  
**Cons:** More logic (renewal, expiry); need to align with current maturity flow.

---

## Recommendation

- **Short term / simplest:** Use **Option A**. Treat "Trading subscription" as the user’s current plan (user_plan_selection). In admin, you can add a read-only "Subscription" block on the user page showing their selected plan and term. No new tables.
- **If you want product tiers later:** Add **Option B** (tiers + tier–plan links) and keep Plans as the source of profit % and term.
- **If you need explicit renewal and periods:** Add **Option C** (subscription table with period_start/end) and wire maturity and renewals to it.

All options keep your existing Plans and user_plan_selection at the center; they only add either a label (A), a tier layer (B), or a subscription lifecycle (C).
