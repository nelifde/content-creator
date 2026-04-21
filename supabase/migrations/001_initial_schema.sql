-- Content Creator MVP schema + RLS
-- Run in Supabase SQL editor or via CLI

create extension if not exists "uuid-ossp";

-- Enums
create type public.workspace_role as enum ('admin', 'editor', 'viewer', 'client');
create type public.asset_type as enum ('logo', 'image', 'video', 'font', 'doc');
create type public.content_status as enum ('draft', 'review', 'approved', 'ready');
create type public.job_status as enum ('queued', 'running', 'completed', 'failed');
create type public.job_input_type as enum (
  'prompt_variants',
  'csv',
  'brief',
  'template_assets',
  'platform_multiply'
);

-- Profiles (mirror auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Workspaces (agencies)
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.workspace_role not null default 'editor',
  primary key (workspace_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  slug text,
  colors jsonb default '[]'::jsonb,
  fonts jsonb default '[]'::jsonb,
  tone text,
  keywords text[] default '{}',
  guideline_pdf_url text,
  created_at timestamptz default now()
);

create table public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  storage_path text not null,
  public_url text,
  type public.asset_type not null default 'image',
  folder text default '',
  tags text[] default '{}',
  version int not null default 1,
  parent_id uuid references public.brand_assets (id) on delete set null,
  created_at timestamptz default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete cascade,
  name text not null,
  is_preset boolean default false,
  layers jsonb not null default '[]'::jsonb,
  preview_url text,
  created_at timestamptz default now(),
  constraint templates_scope check (
    (workspace_id is not null and brand_id is null)
    or (brand_id is not null)
  )
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table public.content_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  input_type public.job_input_type not null,
  payload jsonb not null default '{}'::jsonb,
  status public.job_status not null default 'queued',
  progress int not null default 0,
  error_message text,
  created_by uuid references auth.users (id),
  created_at timestamptz default now()
);

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  job_id uuid references public.content_jobs (id) on delete set null,
  platform text not null,
  aspect_ratio text not null,
  content_type text not null default 'static',
  status public.content_status not null default 'draft',
  caption text,
  title text,
  hashtags text[] default '{}',
  cta text,
  layers jsonb default '[]'::jsonb,
  export_urls jsonb default '{}'::jsonb,
  ai_provider text,
  language text default 'tr',
  created_at timestamptz default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  portal_token_id uuid,
  body text not null,
  parent_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz default now()
);

create table public.asset_usages (
  asset_id uuid not null references public.brand_assets (id) on delete cascade,
  content_id uuid not null references public.contents (id) on delete cascade,
  primary key (asset_id, content_id)
);

create table public.client_portal_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  brand_id uuid not null references public.brands (id) on delete cascade,
  label text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.comments
  add constraint comments_portal_fk
  foreign key (portal_token_id) references public.client_portal_tokens (id) on delete set null;

-- Indexes
create index idx_workspace_members_user on public.workspace_members (user_id);
create index idx_clients_workspace on public.clients (workspace_id);
create index idx_brands_client on public.brands (client_id);
create index idx_assets_brand on public.brand_assets (brand_id);
create index idx_campaigns_brand on public.campaigns (brand_id);
create index idx_contents_campaign on public.contents (campaign_id);
create index idx_contents_status on public.contents (status);
create index idx_jobs_brand on public.content_jobs (brand_id);
create index idx_comments_content on public.comments (content_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clients enable row level security;
alter table public.brands enable row level security;
alter table public.brand_assets enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.content_jobs enable row level security;
alter table public.contents enable row level security;
alter table public.comments enable row level security;
alter table public.asset_usages enable row level security;
alter table public.client_portal_tokens enable row level security;

-- Helper: user is member of workspace
create or replace function public.is_workspace_member(ws uuid, uid uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = uid
  );
$$;

create or replace function public.workspace_role(ws uuid, uid uuid)
returns workspace_role language sql stable security definer set search_path = public
as $$
  select m.role from public.workspace_members m
  where m.workspace_id = ws and m.user_id = uid
  limit 1;
$$;

create or replace function public.brand_workspace_id(bid uuid)
returns uuid language sql stable security definer set search_path = public
as $$
  select c.workspace_id
  from public.brands b
  join public.clients c on c.id = b.client_id
  where b.id = bid
  limit 1;
$$;

-- Profiles
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- Workspaces: members read
create policy "workspace_select" on public.workspaces
  for select using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = id and m.user_id = auth.uid()
    )
  );

create policy "workspace_insert" on public.workspaces
  for insert to authenticated
  with check (auth.uid() is not null);

create policy "workspace_update" on public.workspaces
  for update using (
    public.workspace_role(id, auth.uid()) = 'admin'
  );

-- Members
create policy "wm_select" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "wm_insert" on public.workspace_members
  for insert with check (
    public.workspace_role(workspace_id, auth.uid()) = 'admin'
    or not exists (select 1 from public.workspace_members x where x.workspace_id = workspace_id)
  );

create policy "wm_update" on public.workspace_members
  for update using (public.workspace_role(workspace_id, auth.uid()) = 'admin');

create policy "wm_delete" on public.workspace_members
  for delete using (public.workspace_role(workspace_id, auth.uid()) = 'admin');

-- Clients
create policy "clients_all" on public.clients
  for all using (public.is_workspace_member(workspace_id, auth.uid()))
  with check (public.is_workspace_member(workspace_id, auth.uid()));

-- Brands
create policy "brands_all" on public.brands
  for all using (
    public.is_workspace_member(
      (select c.workspace_id from public.clients c where c.id = client_id),
      auth.uid()
    )
  )
  with check (
    public.is_workspace_member(
      (select c.workspace_id from public.clients c where c.id = client_id),
      auth.uid()
    )
  );

-- Assets
create policy "assets_all" on public.brand_assets
  for all using (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
  )
  with check (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
  );

-- Templates
create policy "templates_select" on public.templates
  for select using (
    (brand_id is not null and public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()))
    or (workspace_id is not null and public.is_workspace_member(workspace_id, auth.uid()))
  );

create policy "templates_write" on public.templates
  for insert with check (
    (brand_id is not null and public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
     and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor'))
    or (workspace_id is not null and public.is_workspace_member(workspace_id, auth.uid())
        and public.workspace_role(workspace_id, auth.uid()) in ('admin','editor'))
  );

create policy "templates_update" on public.templates
  for update using (
    (brand_id is not null and public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
     and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor'))
    or (workspace_id is not null and public.is_workspace_member(workspace_id, auth.uid())
        and public.workspace_role(workspace_id, auth.uid()) in ('admin','editor'))
  );

create policy "templates_delete" on public.templates
  for delete using (
    (brand_id is not null and public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
     and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor'))
    or (workspace_id is not null and public.is_workspace_member(workspace_id, auth.uid())
        and public.workspace_role(workspace_id, auth.uid()) in ('admin','editor'))
  );

-- Campaigns
create policy "campaigns_all" on public.campaigns
  for all using (public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()))
  with check (public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()));

-- Jobs
create policy "jobs_select" on public.content_jobs
  for select using (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
  );

create policy "jobs_insert" on public.content_jobs
  for insert with check (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
    and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor')
  );

create policy "jobs_update" on public.content_jobs
  for update using (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
    and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor')
  );

-- Contents (editors + viewers read; clients via portal use service role or RPC — MVP: editors)
create policy "contents_select" on public.contents
  for select using (public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()));

create policy "contents_insert" on public.contents
  for insert with check (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
    and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor')
  );

create policy "contents_update" on public.contents
  for update using (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
    and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor')
  );

create policy "contents_delete" on public.contents
  for delete using (
    public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid())
    and public.workspace_role(public.brand_workspace_id(brand_id), auth.uid()) in ('admin','editor')
  );

-- Comments
create policy "comments_select" on public.comments
  for select using (
    exists (
      select 1 from public.contents c
      where c.id = content_id
        and public.is_workspace_member(public.brand_workspace_id(c.brand_id), auth.uid())
    )
  );

create policy "comments_insert" on public.comments
  for insert with check (
    exists (
      select 1 from public.contents c
      where c.id = content_id
        and public.is_workspace_member(public.brand_workspace_id(c.brand_id), auth.uid())
    )
    and (user_id is null or user_id = auth.uid())
  );

-- Portal tokens
create policy "portal_tokens_all" on public.client_portal_tokens
  for all using (public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()))
  with check (public.is_workspace_member(public.brand_workspace_id(brand_id), auth.uid()));

-- Asset usages
create policy "asset_usages_all" on public.asset_usages
  for all using (
    exists (
      select 1 from public.brand_assets a
      where a.id = asset_id
        and public.is_workspace_member(public.brand_workspace_id(a.brand_id), auth.uid())
    )
  );

-- Storage bucket (run in dashboard or SQL)
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "brand_assets_storage_read" on storage.objects
  for select using (bucket_id = 'brand-assets');

create policy "brand_assets_storage_write" on storage.objects
  for insert with check (
    bucket_id = 'brand-assets'
    and auth.role() = 'authenticated'
  );

create policy "brand_assets_storage_update" on storage.objects
  for update using (bucket_id = 'brand-assets' and auth.role() = 'authenticated');

create policy "brand_assets_storage_delete" on storage.objects
  for delete using (bucket_id = 'brand-assets' and auth.role() = 'authenticated');
