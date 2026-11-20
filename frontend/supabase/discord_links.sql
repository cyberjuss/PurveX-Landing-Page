-- Which Discord account belongs to which Range student, so the bot can give
-- the Pro role in the PurveX Discord to whoever has Range Pro and take it
-- back when they stop. See lib/academy-discord-roles.ts. Run once in the
-- Supabase SQL editor; safe to run again.

create table if not exists public.academy_discord_links (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- One Discord account drives one Range account's role. Linking it from a
  -- second Range account moves it there.
  discord_user_id text not null unique,
  discord_username text,
  linked_at timestamptz not null default now(),
  -- What the last sync set, and when. For support questions like "why don't
  -- I have the Pro role", not for deciding anything: the decision is always
  -- made fresh from rangeEntitlement().
  role_synced_pro boolean,
  role_synced_at timestamptz
);

alter table public.academy_discord_links enable row level security;

-- Read-your-own only. Every write goes through the server on the
-- service-role key. A write policy here would let a student point their
-- link at someone else's Discord account.
drop policy if exists "Students read their own Discord link" on public.academy_discord_links;
create policy "Students read their own Discord link"
  on public.academy_discord_links for select
  using (auth.uid() = user_id);
