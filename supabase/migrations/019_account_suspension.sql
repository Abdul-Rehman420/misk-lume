-- Add suspended flag to profiles for account suspension/termination
alter table public.profiles add column if not exists suspended boolean not null default false;

comment on column public.profiles.suspended is 'When true, the account is suspended and cannot log in or place orders';

create index if not exists idx_profiles_suspended on public.profiles(suspended);
