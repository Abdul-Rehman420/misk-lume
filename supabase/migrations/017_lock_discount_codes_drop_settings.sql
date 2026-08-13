-- ============================================================================
-- Migration 017: Lock down discount_codes reads + drop unused settings table
-- ============================================================================

-- ============================================================================
-- 1. discount_codes — stop exposing active codes (and their discount values)
-- to anonymous visitors. Validation runs server-side (lib/discounts.ts via the
-- service-role client); the browser never needs to read this table. Only admins
-- may now view codes.
-- ============================================================================
drop policy if exists "Active discount codes are viewable by everyone" on public.discount_codes;

create policy "Admins can view discount codes"
  on public.discount_codes for select
  using (public.is_admin());

-- ============================================================================
-- 2. Drop the unused `settings` table
-- The app reads/writes `store_settings` (migration 008). The `settings` table
-- (migration 001) is not referenced by any application code, trigger, function,
-- or RLS policy outside its own. Dropping it also removes its trigger
-- (set_updated_at_settings) and its RLS policies automatically.
-- ============================================================================
drop table if exists public.settings;
