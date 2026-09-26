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


-- Daily and timed drills. One row per finished drill; the daily drill uses
-- drill_id "daily-YYYY-MM-DD" so it can only be recorded once a day.
create table if not exists public.academy_drill_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  drill_id text not null,
  day date not null,
  mode text not null,
  correct integer not null default 0,
  total integer not null default 0,
  seconds integer not null default 0,
  misses jsonb not null default '[]'::jsonb,
  level integer not null default 1,
  detail jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, drill_id)
);

alter table public.academy_drill_log enable row level security;

drop policy if exists "Students read their own drill log" on public.academy_drill_log;
create policy "Students read their own drill log"
  on public.academy_drill_log for select
  using (auth.uid() = user_id);

-- The AI-written daily scenario, stored as an encrypted token so the same
-- question returns all day and the answer is never readable here.
create table if not exists public.academy_drill_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  kind text not null default 'daily',
  token text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day, kind)
);

alter table public.academy_drill_daily enable row level security;

-- Difficulty levels, per-question detail, the weekly CTF, and results
-- recorded by Coach. Safe to run on a database that already has the tables.
alter table public.academy_drill_log add column if not exists level integer not null default 1;
alter table public.academy_drill_log add column if not exists detail jsonb not null default '[]'::jsonb;
alter table public.academy_drill_log drop constraint if exists academy_drill_log_mode_check;
alter table public.academy_drill_log add constraint academy_drill_log_mode_check check (mode in ('daily', 'timed', 'ctf', 'coach'));

alter table public.academy_drill_daily add column if not exists kind text not null default 'daily';
alter table public.academy_drill_daily drop constraint if exists academy_drill_daily_pkey;
alter table public.academy_drill_daily add primary key (user_id, day, kind);

-- Removed: an earlier draft queued jobs for the student's domain controller. Drills
-- now read the student's real lab and Security log instead. Safe to run:
drop table if exists public.academy_lab_jobs;

-- Live lab verification and faster sync. A student starts a challenge, plants the
-- code in their lab, and the next snapshot proves the lab is live. While a
-- challenge or a lab check is open, the lab script syncs about every minute.
alter table public.academy_lab_state add column if not exists live_until timestamptz;
alter table public.academy_lab_state add column if not exists challenge_code text;
alter table public.academy_lab_state add column if not exists challenge_at timestamptz;
alter table public.academy_lab_state add column if not exists verified_at timestamptz;

-- The intake every student fills in before starting: certifications
-- (Security+, CySA+), target roles, and where they are starting from. Coach,
-- the daily drill and the missions read it.
create table if not exists public.academy_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  certs jsonb not null,
  other_certs text not null default '',
  roles text[] not null,
  start_level text not null check (start_level in ('new', 'some', 'working')),
  background text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.academy_profiles enable row level security;

drop policy if exists "Students read their own academy profile" on public.academy_profiles;
create policy "Students read their own academy profile"
  on public.academy_profiles for select
  using (auth.uid() = user_id);

-- What each target role involves, researched from current job postings and
-- public role guides. One row per role, shared by all students, refreshed
-- every 90 days. Written by the server only.
create table if not exists public.academy_role_briefs (
  role text primary key,
  brief jsonb not null,
  researched_at timestamptz not null default now()
);

alter table public.academy_role_briefs enable row level security;
