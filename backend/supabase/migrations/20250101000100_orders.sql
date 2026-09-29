-- Orders. Rows snapshot product details so historical orders never change.

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Human-friendly sequential order numbers, e.g. ORD-100001.
create sequence public.order_number_seq start with 100001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  email text not null check (position('@' in email) > 1),
  phone text not null,
  status public.order_status not null default 'pending_payment',
  subtotal_paise integer not null check (subtotal_paise >= 0),
  shipping_paise integer not null default 0 check (shipping_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  shipping_address jsonb not null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_matches check (total_paise = subtotal_paise + shipping_paise)
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_email_idx on public.orders (lower(email));
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Nullable so a product can be deleted later without touching order history.
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  image_url text,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
