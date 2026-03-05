This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deposit payment methods (admin-configured)

Payment options on the user **Deposit** page come from the admin only.

1. **Run migrations** in Supabase (SQL Editor or `npx supabase db push`):
   - `011_deposit_method_config.sql` – deposit method config (global / per-user)
   - `013_user_crypto_addresses.sql` – wallet addresses per user
2. In **Admin → Users → [user] → Payment & withdrawal**: add crypto addresses (e.g. BTC, DKA), keep Deposit enabled, then click **Update deposit methods**.
3. The user’s Deposit page will then show those admin-configured wallets (with Copy) after they click the Deposit card.

If the tables don’t exist yet, the Deposit page shows “No payment options set up yet” and the app may log 404s for `deposit_method_config` / `user_crypto_addresses`.

## How the admin sees deposit proofs (notification system)

When a user uploads a payment screenshot and clicks **Send to admin**, the file is uploaded to Supabase Storage (bucket `deposit-screenshots`), a **notification** is created (type: deposit_proof), and the admin gets an **email** (if RESEND is set). The admin sees it in **Admin → Notifications**, can open the screenshot link, and **Accept** or **Reject**.

**One-time setup so uploads work:**  
1. Create the bucket: `node --env-file=.env.local scripts/create-deposit-bucket.mjs`  
2. Allow uploads: run `supabase/storage-policy-deposit-screenshots.sql` in **Supabase Dashboard → SQL Editor**. If that fails with "permission denied", add the policy in **Storage → deposit-screenshots → Policies → New policy**: INSERT for role **authenticated**, with check `bucket_id = 'deposit-screenshots'`.

## Withdrawal methods (admin-configured)

Only **enabled** withdrawal methods (Bank, Cryptocurrency, Paypal, CashApp) show on the user **Withdraw** page. Admin can enable/disable per user and add **multiple options** per method (e.g. multiple bank accounts, PayPal emails, CashApp tags). Crypto withdrawal options use the same crypto addresses as deposit.

1. Run migration `014_withdrawal_method_config_and_options.sql` or `supabase/run-withdrawal-tables.sql` in the Supabase SQL Editor.
2. In **Admin → Users → [user] → Payment & withdrawal**: use the Withdrawal methods section to enable/disable each method and add options (e.g. "+ Add bank option"), then click **Update deposit methods**.
3. The user's Withdraw page will show only enabled methods and, when applicable, a "Choose option" dropdown.

## Plan deposit amount (user pays plan amount → dashboard updates)

Each plan has a **Deposit amount ($)** set in **Admin → Plans** (edit plan, set "Deposit amount ($)").

1. Run migration `015_plans_deposit_amount_and_deposit_submission_plan.sql` in the Supabase SQL Editor (adds `deposit_amount` to `plans` and `plan_id` to `deposit_submissions`).
2. In Admin → Plans, set the deposit amount for each plan (e.g. $100 for "beginner plan").
3. User selects a plan on the dashboard and goes to Deposit (with `?plan=...`). The page shows **Deposit amount: $X** for that plan.
4. User pays that amount, uploads a screenshot, and clicks **Send to admin**. The submitted amount is the plan’s deposit amount.
5. When admin **Accepts** the deposit in Notifications, that amount is added to the user’s **initial_deposit** balance and appears in **Transfer history**; the user dashboard reflects the update.

## Maturity cron job

The app creates **maturity events** when a user’s plan term is reached and **auto-approves** them after 5 minutes if admin doesn’t act.

1. **Set `CRON_SECRET`** in your environment (e.g. in `.env.local` and in Vercel / your host). Use a long random string.
2. **Call the job every 1–2 minutes** so maturities are created and auto-approvals run on time:
   - **Manual:** `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.com/api/cron/maturity`
   - **Vercel Cron:** Add a cron in the Vercel project that hits `GET /api/cron/maturity` with `Authorization: Bearer YOUR_CRON_SECRET` (or use `vercel.json` and Vercel’s cron with the secret in env).
   - **External cron (e.g. cron-job.org):** Schedule GET or POST to `/api/cron/maturity` with header `Authorization: Bearer YOUR_CRON_SECRET` or `x-cron-secret: YOUR_CRON_SECRET`.
