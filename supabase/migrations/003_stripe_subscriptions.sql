-- Stripe billing (Faz 2): customer id on workspace + subscription rows

alter table public.workspaces
  add column if not exists stripe_customer_id text unique;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null default 'incomplete',
  plan_id uuid references public.plans (id) on delete set null,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_subscriptions_workspace on public.subscriptions (workspace_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_workspace_admin" on public.subscriptions
  for select using (
    public.is_workspace_member(workspace_id, auth.uid())
    and public.workspace_role(workspace_id, auth.uid()) = 'admin'
  );

-- Inserts/updates from Stripe webhook use service role only
