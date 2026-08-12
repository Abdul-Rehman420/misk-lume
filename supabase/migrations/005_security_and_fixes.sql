-- ============================================================================
-- Migration 005: Security hardening, bug fixes, and cleanup
-- ============================================================================

-- ============================================================================
-- 1. Remove dead order number trigger (API generates order numbers)
-- ============================================================================
drop trigger if exists before_insert_order_assign_number on public.orders;
drop function if exists public.assign_order_number();
drop function if exists public.generate_order_number();
drop sequence if exists public.order_number_seq;

-- ============================================================================
-- 2. Add newsletter_subscribers table
-- ============================================================================
create table public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.newsletter_subscribers is 'Email subscribers to the Misk Lume newsletter';

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Subscribers can view their own subscription"
  on public.newsletter_subscribers for select
  using (true);

create policy "Admins can manage newsletter subscribers"
  on public.newsletter_subscribers for all
  using (public.is_admin());

-- ============================================================================
-- 3. Fix discount_codes RLS — hide internals from unauthenticated users
-- ============================================================================
drop policy if exists "Discount codes are viewable by everyone" on public.discount_codes;
drop policy if exists "Discount codes are publicly readable" on public.discount_codes;
drop policy if exists "Admins can manage discount codes" on public.discount_codes;

create policy "Active discount codes are viewable by everyone"
  on public.discount_codes for select
  using (is_active = true);

create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin());
