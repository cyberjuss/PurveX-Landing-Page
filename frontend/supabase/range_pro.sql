-- Run this once in the Supabase SQL editor, after academy.sql.
--
-- What a student is entitled to in Range. One row per student, written only
-- by the Stripe webhook (api/stripe-webhook/route.ts -> lib/range-billing.ts)
-- with the service-role key.
--
-- Deliberately NOT portal_profiles. That table is lead/CRM data for the $99
-- self-hosted Platform product, and its own RLS lets a signed-in user write
-- any column on their own row -- which is safe there precisely because
-- nothing reads it to grant access (see portal_profiles.sql). Range Pro is a
-- real entitlement read on every gated request, so it needs a table users
-- cannot write at all.

create table if not exists public.academy_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  -- Mirrors Stripe's subscription.status, plus 'none' for a row that exists
  -- but never had an active subscription. 'active' and 'trialing' are the
  -- only two that grant Pro -- see rangePlan() in lib/range-plan.ts.
  status text not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  -- End of the paid period. Pro survives until this passes even after the
  -- student cancels, which is what "cancel the moment you want to" on the
  -- pricing page promises: cancelling stops renewal, it does not cut off
  -- access already paid for.
  current_period_end timestamptz,
  started_at timestamptz,
  canceled_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists academy_subscriptions_customer_idx
  on public.academy_subscriptions (stripe_customer_id);

alter table public.academy_subscriptions enable row level security;

-- Read-your-own only. There is deliberately no insert, update or delete
-- policy for authenticated users: every write goes through the webhook on
-- the service-role key, which bypasses RLS. Adding a write policy here
-- would let any signed-in student set their own status to 'active' and
-- take every Pro feature for free.
drop policy if exists "Students read their own subscription" on public.academy_subscriptions;
create policy "Students read their own subscription"
  on public.academy_subscriptions for select
  using (auth.uid() = user_id);
