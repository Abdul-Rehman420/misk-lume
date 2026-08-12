-- ============================================================================
-- C9: Make discount usage enforcement actually work
-- increment_discount_usage was SECURITY INVOKER and never granted EXECUTE to
-- authenticated, so the app's RPC call ran as the customer against a table RLS
-- forbids customers from updating -> it silently updated 0 rows and
-- usage_limit was never enforced. Now security definer + atomic conditional
-- increment, returning whether the code still had room.
-- ============================================================================
-- The migration-007 version returns void; 015 must replace it (returns boolean),
-- which requires dropping the old signature first.
-- ============================================================================
drop function if exists public.increment_discount_usage(text);
create or replace function public.increment_discount_usage(code_text text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  update public.discount_codes
  set used_count = used_count + 1
  where code = code_text
    and is_active = true
    and (usage_limit is null or used_count < usage_limit);
  return found;
end;
$$;

grant execute on function public.increment_discount_usage(text) to authenticated;

-- Drop unused helper (no application code calls it anymore)
drop function if exists public.check_stock(uuid, integer);

-- ============================================================================
-- C10: Newsletter opt-in
-- Explicit marketing-consent flag. The app requires consent before storing a
-- subscriber (GDPR/PECR-style opt-in).
-- ============================================================================
alter table public.newsletter_subscribers
  add column if not exists consent boolean not null default false;

comment on column public.newsletter_subscribers.consent is 'Explicit marketing consent given at signup. The API rejects signups without it.';

-- ============================================================================
-- C6: Seed bank details into store_settings
-- The live store_settings table is empty, so the checkout page has been
-- rendering fallback constants. These upserts make the checkout bank copy
-- genuinely server-driven.
-- ============================================================================
insert into public.store_settings (key, value) values
  ('bank_name',          'Meezan Bank'),
  ('account_title',      'Misk Lume (Pvt) Ltd'),
  ('account_number',     '0123-0101-2345678-01'),
  ('iban',               'PK90MEZN0001230101234567801')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============================================================================
-- Monitoring / analytics
-- Lightweight self-hosted event log (page views + product/order events).
-- ============================================================================
create table if not exists public.analytics_events (
  id uuid default uuid_generate_v4() primary key,
  event_type text not null,
  page text,
  referrer text,
  user_agent text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.analytics_events is 'Anonymous analytics events collected by the app beacon';

alter table public.analytics_events enable row level security;

create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);

create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

create policy "Admins can view analytics events"
  on public.analytics_events for select
  using (public.is_admin());

create policy "Admins can delete analytics events"
  on public.analytics_events for delete
  using (public.is_admin());
