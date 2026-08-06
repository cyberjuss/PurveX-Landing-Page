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
