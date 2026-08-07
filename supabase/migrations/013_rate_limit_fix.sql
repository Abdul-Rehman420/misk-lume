-- ============================================================================
-- C2: Fix rate limiting (was silently failing open)
-- Problems:
--   1) rate-limit.ts upserted with onConflict: "key", but `key` only had a
--      non-unique index (idx_rate_limits_key), so every upsert errored and
--      rate limiting silently failed open — all endpoints were unthrottled.
--   2) rate_limits had no RLS, so anyone with the public anon key could read,
--      write, or delete rate-limit rows via the REST API.
-- Fix:
--   - Dedupe existing rows, then add a unique constraint on `key`.
--   - Enable RLS with no policies so clients can no longer touch the table.
--   - Move read/write logic into one atomic security definer RPC, executed by
--     the app. A single INSERT..ON CONFLICT statement removes the
--     select-then-update race the old code had.
-- ============================================================================

-- 1) Dedupe (keep the newest row per key) before the unique constraint
delete from rate_limits a
using rate_limits b
where a.key = b.key and a.id < b.id;

-- 2) Unique constraint on key
alter table rate_limits
  add constraint rate_limits_key_unique unique (key);

-- 3) Lock the table down. RLS on with no policies = anon/authenticated can no
--    longer select/insert/update/delete rows directly.
alter table rate_limits enable row level security;

-- 4) Atomic rate-limit RPC.
--    Fresh or expired key  -> insert count = 1, success
--    Existing, within window -> count + 1, success while count <= limit
create or replace function public.apply_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms bigint
) returns table (success boolean, remaining integer)
language sql security definer set search_path = ''
as $$
  with applied as (
    insert into public.rate_limits (key, count, reset_at)
    values (p_key, 1, now() + (p_window_ms * interval '0.001 seconds'))
    on conflict (key) do update set
      count = case
        when rate_limits.reset_at < now() then 1
        else rate_limits.count + 1
      end,
      reset_at = case
        when rate_limits.reset_at < now() then excluded.reset_at
        else rate_limits.reset_at
      end
    returning count
  )
  select
    (select count from applied) <= p_limit as success,
    greatest(p_limit - (select count from applied), 0)::integer as remaining;
$$;

-- Cleanup still needs to bypass RLS now that it is enabled
create or replace function public.cleanup_rate_limits() returns void
language sql security definer set search_path = ''
as $$
  delete from public.rate_limits where reset_at < now();
$$;

-- Function execution is granted separately from table RLS
grant execute on function public.apply_rate_limit(text, integer, bigint) to anon, authenticated;
grant execute on function public.cleanup_rate_limits() to anon, authenticated;
