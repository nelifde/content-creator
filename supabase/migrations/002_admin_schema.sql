-- Admin panel: platform admins, plans, quotas, usage, audit
-- Run after 001_initial_schema.sql

-- Plans (catalog)
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

insert into public.plans (id, name, limits)
values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'free',
  jsonb_build_object(
    'ai_calls_per_period', 500,
    'storage_bytes', 536870912,
    'contents_per_period', 2000
  )
)
on conflict (id) do nothing;

alter table public.workspaces
  add column if not exists plan_id uuid references public.plans (id) on delete set null,
  add column if not exists suspended boolean not null default false;

update public.workspaces
set plan_id = '00000000-0000-0000-0000-000000000001'::uuid
where plan_id is null;

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- Platform super-admins (row visibility: own row only for auth check)
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.platform_admins enable row level security;

create policy "platform_admins_select_own" on public.platform_admins
  for select using (auth.uid() = user_id);

-- Workspace quotas (override plan defaults)
create table public.workspace_quotas (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  ai_calls_limit int,
  storage_bytes_limit bigint,
  contents_limit int,
  period_start timestamptz default date_trunc('month', now() at time zone 'utc')
);

-- Backfill quotas from free plan for existing workspaces
insert into public.workspace_quotas (workspace_id, ai_calls_limit, storage_bytes_limit, contents_limit)
select
  w.id,
  (p.limits->>'ai_calls_per_period')::int,
  (p.limits->>'storage_bytes')::bigint,
  (p.limits->>'contents_per_period')::int
from public.workspaces w
cross join public.plans p
where p.id = '00000000-0000-0000-0000-000000000001'::uuid
on conflict (workspace_id) do nothing;

-- Usage events (incremental)
create table public.workspace_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  kind text not null,
  amount int not null default 1,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_workspace_usage_ws_created on public.workspace_usage_events (workspace_id, created_at desc);
create index idx_workspace_usage_kind on public.workspace_usage_events (workspace_id, kind);

-- Audit log
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_role text,
  scope text not null default 'workspace',
  workspace_id uuid references public.workspaces (id) on delete set null,
  target_table text,
  target_id uuid,
  action text not null,
  diff jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_audit_workspace on public.audit_logs (workspace_id, created_at desc);
create index idx_audit_created on public.audit_logs (created_at desc);

-- Helper: platform admin check (for RLS)
create or replace function public.is_platform_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins p where p.user_id = uid
  );
$$;

-- RLS: plans (read for authenticated)
alter table public.plans enable row level security;

create policy "plans_select_authenticated" on public.plans
  for select to authenticated using (true);

-- RLS: workspace_quotas
alter table public.workspace_quotas enable row level security;

create policy "wq_select_members" on public.workspace_quotas
  for select using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "wq_update_admin" on public.workspace_quotas
  for update using (public.workspace_role(workspace_id, auth.uid()) = 'admin');

create policy "wq_insert_admin" on public.workspace_quotas
  for insert with check (public.workspace_role(workspace_id, auth.uid()) = 'admin');

-- RLS: workspace_usage_events
alter table public.workspace_usage_events enable row level security;

create policy "wue_select_members" on public.workspace_usage_events
  for select using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "wue_insert_editors" on public.workspace_usage_events
  for insert with check (
    public.is_workspace_member(workspace_id, auth.uid())
    and public.workspace_role(workspace_id, auth.uid()) in ('admin', 'editor')
  );

-- RLS: audit_logs
alter table public.audit_logs enable row level security;

create policy "audit_select" on public.audit_logs
  for select using (
    public.is_platform_admin(auth.uid())
    or (
      workspace_id is not null
      and public.workspace_role(workspace_id, auth.uid()) = 'admin'
    )
  );

-- Workspaces: allow platform admin to read all (for super-admin UI via user client — optional)
-- Normal members already have workspace_select. Add policy for platform admin:
create policy "workspace_select_platform_admin" on public.workspaces
  for select using (public.is_platform_admin(auth.uid()));

-- Views
create or replace view public.v_workspace_usage_summary as
select
  w.id as workspace_id,
  coalesce(sum(case when e.kind = 'ai_call' then e.amount else 0 end) filter (where e.created_at > now() - interval '30 days'), 0)::bigint as ai_calls_30d,
  coalesce(sum(case when e.kind = 'storage_bytes' then e.amount else 0 end) filter (where e.created_at > now() - interval '30 days'), 0)::bigint as storage_bytes_30d,
  coalesce(sum(case when e.kind = 'content_created' then e.amount else 0 end) filter (where e.created_at > now() - interval '30 days'), 0)::bigint as contents_30d
from public.workspaces w
left join public.workspace_usage_events e on e.workspace_id = w.id
group by w.id;

create or replace view public.v_workspace_job_stats as
select
  public.brand_workspace_id(cj.brand_id) as workspace_id,
  cj.status::text as status,
  count(*)::bigint as cnt
from public.content_jobs cj
group by public.brand_workspace_id(cj.brand_id), cj.status;

-- Grant select on views to authenticated
grant select on public.v_workspace_usage_summary to authenticated;
grant select on public.v_workspace_job_stats to authenticated;

-- Auto-create quota row for new workspaces
create or replace function public.ensure_workspace_quota_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  pid := coalesce(new.plan_id, '00000000-0000-0000-0000-000000000001'::uuid);
  insert into public.workspace_quotas (workspace_id, ai_calls_limit, storage_bytes_limit, contents_limit)
  select
    new.id,
    (p.limits->>'ai_calls_per_period')::int,
    (p.limits->>'storage_bytes')::bigint,
    (p.limits->>'contents_per_period')::int
  from public.plans p
  where p.id = pid
  on conflict (workspace_id) do nothing;
  return new;
end;
$$;

drop trigger if exists tr_workspaces_quota on public.workspaces;
create trigger tr_workspaces_quota
  after insert on public.workspaces
  for each row execute function public.ensure_workspace_quota_row();

-- Seed first platform admin (replace UUID after signup — run manually in SQL editor):
-- insert into public.platform_admins (user_id) values ('YOUR_USER_UUID');
