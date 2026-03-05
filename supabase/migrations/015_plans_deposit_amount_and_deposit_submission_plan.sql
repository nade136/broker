-- Plan deposit amount: each plan has a set amount the user must deposit; when they pay and send screenshot, that amount is recorded and (when admin accepts) credited on the user dashboard.
-- Also link deposit_submissions to the plan so we know which plan the deposit was for.

alter table public.plans
  add column if not exists deposit_amount numeric(18,2) not null default 0;

comment on column public.plans.deposit_amount is 'Required deposit amount for this plan. Shown on Deposit page; when user sends proof, this amount is submitted and credited on accept.';

alter table public.deposit_submissions
  add column if not exists plan_id uuid references public.plans(id) on delete set null;

create index if not exists deposit_submissions_plan_id_idx on public.deposit_submissions(plan_id);
comment on column public.deposit_submissions.plan_id is 'Plan the user was depositing for (from deposit URL ?plan=).';
