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

-- Coach questions per browser lab per day, so one lab cannot use up the day.
create table if not exists public.academy_lab_coach_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  lab text not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day, lab)
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
alter table public.academy_lab_coach_usage enable row level security;
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

-- Proof Profile: a student's public page of confirmed lab work, shared with
-- employers at /p/<slug>. One row per student. Nothing is public until
-- published is true. avatar_path points at the student's photo in the
-- proof-screenshots bucket. shots_on lists the lab work items (job ids) whose
-- screenshots the student switched on; each shows up to 5 screenshots.
create table if not exists public.academy_public_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'),
  display_name text not null,
  published boolean not null default false,
  show_skills boolean not null default true,
  shots_on text[] not null default '{}',
  avatar_path text,
  resume_path text,
  contact_email text,
  linkedin_url text,
  github_url text,
  website_url text,
  location text,
  availability text,
  extra_certs jsonb not null default '[]'::jsonb,
  credential_id text not null unique,
  updated_at timestamptz not null default now()
);

-- Added after the first release: the student's profile photo.
alter table public.academy_public_profiles add column if not exists avatar_path text;
-- And the contact, availability and resume fields employers asked for.
alter table public.academy_public_profiles add column if not exists resume_path text;
alter table public.academy_public_profiles add column if not exists contact_email text;
alter table public.academy_public_profiles add column if not exists linkedin_url text;
alter table public.academy_public_profiles add column if not exists github_url text;
alter table public.academy_public_profiles add column if not exists website_url text;
alter table public.academy_public_profiles add column if not exists location text;
alter table public.academy_public_profiles add column if not exists availability text;
alter table public.academy_public_profiles add column if not exists extra_certs jsonb not null default '[]'::jsonb;

alter table public.academy_public_profiles enable row level security;

drop policy if exists "Students read their own proof profile" on public.academy_public_profiles;
create policy "Students read their own proof profile"
  on public.academy_public_profiles for select
  using (auth.uid() = user_id);

-- Screenshots a student attaches to a lab work item (PNG or JPEG, under 4 MB).
-- The image lives in the private proof-screenshots bucket; the server streams it to the page.
create table if not exists public.academy_profile_screenshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job text not null,
  path text not null,
  content_type text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists academy_profile_screenshots_user_job
  on public.academy_profile_screenshots (user_id, job);

alter table public.academy_profile_screenshots enable row level security;

drop policy if exists "Students read their own proof screenshots" on public.academy_profile_screenshots;
create policy "Students read their own proof screenshots"
  on public.academy_profile_screenshots for select
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('proof-screenshots', 'proof-screenshots', false)
on conflict (id) do nothing;

-- Optional, self-reported work eligibility shown to employers.
alter table public.academy_public_profiles add column if not exists work_auth text;
alter table public.academy_public_profiles add column if not exists clearance text;

-- Where each student is in the Academy: the page, the tab, and the step inside
-- a browser lab. Reported by the page, read by Coach and the MCP server.
-- Written by the server only.
create table if not exists public.academy_activity (
  user_id uuid primary key references auth.users (id) on delete cascade,
  place jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.academy_activity enable row level security;

-- Classes: each has its own passcode and an instructor, who sees the class's
-- progress at /academy/instructor. A student joins by unlocking with the
-- class code, then signing in. Written by the server only.
create table if not exists public.academy_classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9-]{6,40}$'),
  name text not null,
  instructor_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists academy_classes_instructor on public.academy_classes (instructor_email);

create table if not exists public.academy_class_members (
  class_id uuid not null references public.academy_classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text,
  name text,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);

alter table public.academy_classes enable row level security;
alter table public.academy_class_members enable row level security;

-- Hosted labs: each student's own domain controller in AWS. The lab key is
-- separate from the MCP key, so starting a lab never disconnects Claude. It
-- can only upload lab snapshots. Only its hash is stored. The remote-desktop
-- password is encrypted with HOSTED_LAB_SECRET. Written by the server only.
create table if not exists public.academy_lab_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.academy_hosted_labs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  instance_id text not null,
  password_enc text not null,
  stop_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.academy_lab_keys enable row level security;
alter table public.academy_hosted_labs enable row level security;
