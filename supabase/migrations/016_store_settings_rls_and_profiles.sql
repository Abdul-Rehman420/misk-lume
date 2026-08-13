-- ============================================================================
-- Migration 016: Harden store_settings + profiles, drop orphaned newsletter table
-- ============================================================================

-- ============================================================================
-- 1. store_settings — enable RLS + admin-only writes
-- The checkout page reads bank details with the anon key (public select is
-- required). But with RLS disabled, the anon key also had INSERT/UPDATE/DELETE,
-- so any visitor could rewrite the bank account / IBAN shown at checkout.
-- Writes are now restricted to admins.
-- ============================================================================
alter table public.store_settings enable row level security;

create policy "Store settings are publicly readable"
  on public.store_settings for select
  using (true);

create policy "Admins can insert store settings"
  on public.store_settings for insert
  with check (public.is_admin());

create policy "Admins can update store settings"
  on public.store_settings for update
  using (public.is_admin());

create policy "Admins can delete store settings"
  on public.store_settings for delete
  using (public.is_admin());

-- ============================================================================
-- 2. profiles — stop exposing every row to anonymous users
-- The select policy was `using (true)`, so anyone with the anon key could dump
-- every customer's email/name/role or enumerate guessable UUIDs. Users may now
-- only read their own profile; admins (is_admin is security definer) read all.
-- ============================================================================
drop policy if exists "Profiles are publicly readable" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- ============================================================================
-- 3. Drop the orphaned newsletter table
-- The newsletter feature was removed from the product entirely. The table and
-- its policies are no longer referenced by any code.
-- ============================================================================
drop table if exists public.newsletter_subscribers;
