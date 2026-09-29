-- Email bookkeeping, shipping details and newsletter subscribers.

alter table public.orders
  -- Each email is claimed with a single UPDATE ... WHERE <column> IS NULL, so it is sent at most once
  -- even when the browser verify step and the webhook both fire. A failed send releases its claim.
  add column customer_email_sent_at timestamptz,
  add column admin_email_sent_at timestamptz,
  add column shipped_email_sent_at timestamptz,
  add column courier_name text,
  add column tracking_number text,
  add column tracking_url text,
  add column shipped_at timestamptz;

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1),
  source text not null default 'homepage',
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness.
create unique index subscribers_email_key on public.subscribers (lower(email));

-- Server-only: no client access. The service role bypasses RLS.
alter table public.subscribers enable row level security;
revoke all on public.subscribers from anon, authenticated;
