-- Rate limiting table for API endpoint protection
create table if not exists rate_limits (
  id bigint generated always as identity primary key,
  key text not null,
  count integer not null default 1,
  reset_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_rate_limits_key on rate_limits(key);
create index if not exists idx_rate_limits_reset_at on rate_limits(reset_at);

-- Cleanup old entries periodically
create or replace function cleanup_rate_limits() returns void
language sql as $$
  delete from rate_limits where reset_at < now();
$$;
