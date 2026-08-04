-- Run this once in the Supabase SQL editor for your project.
-- Tracks the plan a portal account selected, for lead visibility and manual
-- license issuance (see docs on the "self-hosted + license key" model).
-- This table has nothing to do with any PurveX product instance's own
-- users/organizations tables -- it only ever describes the portal account.

create table if not exists public.portal_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'unselected' check (plan in ('unselected', 'free', 'paid')),
  stripe_checkout_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_profiles enable row level security;

-- A signed-in user may create and read only their own profile row. No
-- update/delete policy for authenticated users: plan changes go through the
-- pricing page's insert-or-update-own-row flow below, nothing destructive.
create policy "Users can view their own portal profile"
  on public.portal_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own portal profile"
  on public.portal_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own portal profile"
  on public.portal_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No policy grants anon or authenticated users select access to other
-- rows: full visibility across all signups is only available from the
-- Supabase dashboard (Table Editor) or with the service role key, same
-- convention as waitlist_signups.sql.
