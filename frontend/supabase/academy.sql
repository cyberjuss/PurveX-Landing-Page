-- Academy student progress and PurveX Coach usage, one row per Supabase
-- Auth account. Run in the Supabase SQL editor. The Next.js server writes
-- with the service role; students can only read their own rows.

create table if not exists public.academy_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_coach_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- One connection key per student, embedded in their downloaded
-- Build-Environment.ps1. Only the SHA-256 of the key is stored.
create table if not exists public.academy_mcp_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

-- Latest Active Directory lab snapshot per student, uploaded at the end of
-- each Build-Environment.ps1 run. Each upload replaces the previous one.
create table if not exists public.academy_lab_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  snapshot jsonb not null,
  captured_at timestamptz not null,
  uploaded_at timestamptz not null default now()
);

alter table public.academy_lab_state enable row level security;

drop policy if exists "Students read their own lab state" on public.academy_lab_state;
create policy "Students read their own lab state"
  on public.academy_lab_state for select
  using (auth.uid() = user_id);

alter table public.academy_progress enable row level security;
alter table public.academy_coach_usage enable row level security;
alter table public.academy_mcp_keys enable row level security;

drop policy if exists "Students read their own academy progress" on public.academy_progress;
create policy "Students read their own academy progress"
  on public.academy_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Students read their own coach usage" on public.academy_coach_usage;
create policy "Students read their own coach usage"
  on public.academy_coach_usage for select
  using (auth.uid() = user_id);
