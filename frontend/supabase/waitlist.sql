-- Run this once in the Supabase SQL editor for your project.
-- Creates the table the PurveX Labs waitlist form writes to, with RLS
-- locked down so the public anon key can insert but never read back rows.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

create policy "Public can join the waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

-- No select/update/delete policy for anon: signups are only readable from
-- the Supabase dashboard (Table Editor) or with the service role key.
