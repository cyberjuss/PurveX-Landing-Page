-- Run this once in the Supabase SQL editor.
-- Conversation holds from the landing-page close card.
-- Public can insert. Nobody on the anon key can read the rows back.

create table if not exists public.conversation_holds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  need text not null,
  source text,
  created_at timestamptz not null default now()
);

alter table public.conversation_holds enable row level security;

create policy "Public can send a hold"
  on public.conversation_holds
  for insert
  to anon
  with check (true);
