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

-- Set by the Stripe webhook (api/stripe-webhook/route.ts) once payment
-- actually clears -- distinct from `plan`, which the pricing page sets to
-- "paid" the moment the customer is redirected to Stripe, before payment is
-- confirmed. `stripe_payment_confirmed` is the ground truth for "did this
-- person actually pay," for the owner's own lead tracking.
--
-- IMPORTANT: this table is lead/CRM data only, not an entitlement source.
-- The "Users can update their own portal profile" policy below lets a
-- signed-in user write any column on their own row, including this one --
-- fine, because nothing reads stripe_payment_confirmed to grant real
-- product access. The actual paid-tier gate is the cryptographically
-- signed license key applied in the PurveX product itself (Settings ->
-- License), which this table has no bearing on. Do not wire real
-- entitlements to this column without adding proper write protection.
alter table public.portal_profiles add column if not exists stripe_payment_confirmed boolean not null default false;
alter table public.portal_profiles add column if not exists stripe_session_id text;
alter table public.portal_profiles add column if not exists paid_at timestamptz;

-- Stripe's Customer id (cus_...), stored on first checkout so the webhook
-- can map a later `invoice.paid` renewal event -- which carries a customer
-- id but no client_reference_id -- back to this row.
alter table public.portal_profiles add column if not exists stripe_customer_id text;
create index if not exists portal_profiles_stripe_customer_id_idx on public.portal_profiles (stripe_customer_id);

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

-- Self-service license retrieval (see /my-license). Issuance stays entirely
-- manual -- the owner still runs backend/scripts/issue_license.py by hand,
-- the ed25519 signing key never leaves their machine -- this only changes
-- *delivery*: the owner's CLI can push the token straight here (issue_license.py
-- --deliver-to) instead of the customer having to wait on an email that
-- might land in spam or get lost by the time a renewal rolls around.
--
-- Same reasoning as stripe_payment_confirmed above applies to why the
-- broad "update own row" policy below is fine for this column too: a
-- customer who overwrites their own current_license_key with garbage only
-- breaks their own copy (the real check is the ed25519 signature the
-- product verifies independently -- garbage just fails verification and
-- falls back to free, same as any other invalid key). Nothing reads this
-- column to grant access from Supabase's side.
alter table public.portal_profiles add column if not exists current_license_key text;
alter table public.portal_profiles add column if not exists license_issued_at timestamptz;

-- Stripe webhook idempotency. Stripe's own docs guarantee at-least-once
-- delivery, meaning the same event can arrive twice (retry after a slow
-- response, occasional duplicate delivery). Without this, a redelivered
-- checkout.session.completed or invoice.paid sends duplicate "customer
-- paid" / "customer renewed" emails. The webhook inserts the event id here
-- before doing any work; a unique-violation on that insert means "already
-- processed," and it skips straight to returning 200.
create table if not exists public.processed_stripe_events (
  id text primary key,
  processed_at timestamptz not null default now()
);

-- RLS must stay ON with zero anon/authenticated policies -- that is what
-- actually restricts this table to the service-role key. Leaving RLS OFF
-- does NOT achieve "service-role only": Supabase grants anon/authenticated
-- default schema-level privileges on public tables regardless of RLS
-- state, so a table with RLS disabled is exposed to the PostgREST API for
-- anyone holding a valid (even anon) API key. The service-role key bypasses
-- RLS either way, so enabling it costs that key nothing while closing the
-- gap for everyone else. (Found and fixed during a security review --
-- this table previously shipped with RLS left off entirely.)
alter table public.processed_stripe_events enable row level security;

-- Automated license issuance handoff. The webhook (server, no signing key)
-- cannot issue a license itself -- the ed25519 signing key deliberately
-- never leaves the owner's machine (see backend/scripts/issue_license.py).
-- Instead it drops a row here, and scripts/poll_license_issuance.py --
-- running on that same machine, on a schedule -- drains this table, signs
-- each token locally, and delivers it straight to the customer's
-- portal_profiles row. This is what turns "issued by hand within a
-- business day" into "issued within a few minutes" without the signing key
-- ever touching a server.
create table if not exists public.license_issuance_queue (
  id bigint generated always as identity primary key,
  portal_user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('new', 'renewal')),
  days integer not null,
  seats integer not null default 0,
  runners integer not null default 0,
  stripe_event_id text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

-- CRITICAL: RLS must stay ON with zero anon/authenticated policies. The
-- webhook and poller both use the service-role key, which bypasses RLS
-- regardless of whether it's enabled -- so this costs them nothing. But
-- if RLS were left off (as it previously was), any authenticated user
-- could INSERT a row here claiming their own portal_user_id with whatever
-- days/seats/runners they want, and the poller would sign and deliver it
-- as a real, valid paid license -- a complete payment bypass. This is the
-- single most important RLS setting in this file.
alter table public.license_issuance_queue enable row level security;

-- The poller only ever wants "what's still pending" -- keeps that scan cheap
-- indefinitely instead of degrading as processed rows pile up.
create index if not exists license_issuance_queue_pending_idx
  on public.license_issuance_queue (created_at)
  where processed_at is null;
