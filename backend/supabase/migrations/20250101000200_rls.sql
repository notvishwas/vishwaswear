-- Row Level Security.

-- ── Catalog: public read of active items, admin-only writes ─
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Active products are public"
  on public.products for select
  to anon, authenticated
  using (is_active);

create policy "Images of active products are public"
  on public.product_images for select
  to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.is_active
  ));

create policy "Variants of active products are public"
  on public.product_variants for select
  to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_variants.product_id and p.is_active
  ));

create policy "Admins manage categories"
  on public.categories for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins manage products"
  on public.products for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins manage product images"
  on public.product_images for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins manage product variants"
  on public.product_variants for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ── Profiles ───────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Users may only change their name; role changes happen with the service role.
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
revoke insert, delete on public.profiles from anon, authenticated;

-- ── Orders: no client access at all ────────────────────────
-- RLS is enabled with no policies, and table privileges are revoked as a second
-- layer. Server code uses the service role, which bypasses RLS.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
revoke all on sequence public.order_number_seq from anon, authenticated;
