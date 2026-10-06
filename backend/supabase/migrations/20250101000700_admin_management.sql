-- Admin management: order status changes with stock restore, atomic product saves, customer list.
-- Every function here is callable by the service role only; the app checks the admin role first.

-- ── Order timeline ──────────────────────────────────────────
create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_id_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;
revoke all on public.order_events from anon, authenticated;

-- ── Order status changes ────────────────────────────────────
-- Allowed moves:
--   pending_payment -> cancelled
--   paid            -> processing, shipped, cancelled, refunded
--   processing      -> shipped, cancelled, refunded
--   shipped         -> delivered, refunded
--   delivered       -> refunded
-- Cancelling or refunding a paid order puts its stock back, in the same transaction as the status
-- change. A cancelled or refunded order can never move again, so stock is restored at most once.
--
-- Returns: 'ok', 'not_found', 'invalid_transition' or 'courier_required'.
create function public.admin_update_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_admin_id uuid default null,
  p_courier_name text default null,
  p_tracking_number text default null,
  p_tracking_url text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_item record;
  v_allowed boolean;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return 'not_found';
  end if;

  v_allowed := case v_order.status
    when 'pending_payment' then p_status = 'cancelled'
    when 'paid' then p_status in ('processing', 'shipped', 'cancelled', 'refunded')
    when 'processing' then p_status in ('shipped', 'cancelled', 'refunded')
    when 'shipped' then p_status in ('delivered', 'refunded')
    when 'delivered' then p_status = 'refunded'
    else false
  end;

  if not v_allowed then
    return 'invalid_transition';
  end if;

  if p_status = 'shipped' and coalesce(btrim(p_courier_name), '') = '' then
    return 'courier_required';
  end if;

  -- Stock is only taken once an order is paid, so only paid orders give it back.
  if p_status in ('cancelled', 'refunded') and v_order.status <> 'pending_payment' then
    for v_item in
      select variant_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = v_order.id and variant_id is not null
      group by variant_id
      order by variant_id
    loop
      update public.product_variants
      set stock = stock + v_item.quantity
      where id = v_item.variant_id;
    end loop;
  end if;

  update public.orders
  set status = p_status,
      courier_name = case when p_status = 'shipped' then btrim(p_courier_name) else courier_name end,
      tracking_number = case when p_status = 'shipped' then nullif(btrim(p_tracking_number), '') else tracking_number end,
      tracking_url = case when p_status = 'shipped' then nullif(btrim(p_tracking_url), '') else tracking_url end,
      shipped_at = case when p_status = 'shipped' then now() else shipped_at end
  where id = v_order.id;

  insert into public.order_events (order_id, status, note, created_by)
  values (
    v_order.id,
    p_status,
    case when p_status = 'shipped' then 'Shipped with ' || btrim(p_courier_name) else null end,
    p_admin_id
  );

  return 'ok';
end;
$$;

revoke execute on function public.admin_update_order_status(uuid, public.order_status, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_update_order_status(uuid, public.order_status, uuid, text, text, text)
  to service_role;

-- ── Product save (product + variants + images, atomically) ──
-- p_variants: [{id?, size, color, sku, stock}]   p_images: [{id?, url, alt}] (array order = sort order)
-- Rows missing from the arrays are deleted. Returns the product id.
create function public.admin_save_product(
  p_id uuid,
  p_product jsonb,
  p_variants jsonb,
  p_images jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := p_id;
  v_row record;
begin
  if v_id is null then
    insert into public.products (
      category_id, name, slug, description, price_paise, compare_at_price_paise,
      fabric, fit, care_instructions, is_active, is_featured
    )
    values (
      (p_product ->> 'category_id')::uuid,
      p_product ->> 'name',
      p_product ->> 'slug',
      nullif(p_product ->> 'description', ''),
      (p_product ->> 'price_paise')::integer,
      (p_product ->> 'compare_at_price_paise')::integer,
      nullif(p_product ->> 'fabric', ''),
      nullif(p_product ->> 'fit', ''),
      nullif(p_product ->> 'care_instructions', ''),
      coalesce((p_product ->> 'is_active')::boolean, true),
      coalesce((p_product ->> 'is_featured')::boolean, false)
    )
    returning id into v_id;
  else
    update public.products
    set category_id = (p_product ->> 'category_id')::uuid,
        name = p_product ->> 'name',
        slug = p_product ->> 'slug',
        description = nullif(p_product ->> 'description', ''),
        price_paise = (p_product ->> 'price_paise')::integer,
        compare_at_price_paise = (p_product ->> 'compare_at_price_paise')::integer,
        fabric = nullif(p_product ->> 'fabric', ''),
        fit = nullif(p_product ->> 'fit', ''),
        care_instructions = nullif(p_product ->> 'care_instructions', ''),
        is_active = coalesce((p_product ->> 'is_active')::boolean, true),
        is_featured = coalesce((p_product ->> 'is_featured')::boolean, false)
    where id = v_id;

    if not found then
      raise exception 'product_not_found' using errcode = 'P0002';
    end if;
  end if;

  -- Variants
  delete from public.product_variants
  where product_id = v_id
    and id not in (
      select (e ->> 'id')::uuid from jsonb_array_elements(p_variants) e where e ->> 'id' is not null
    );

  for v_row in select e from jsonb_array_elements(p_variants) e loop
    if v_row.e ->> 'id' is not null then
      update public.product_variants
      set size = v_row.e ->> 'size',
          color = v_row.e ->> 'color',
          sku = v_row.e ->> 'sku',
          stock = (v_row.e ->> 'stock')::integer
      where id = (v_row.e ->> 'id')::uuid and product_id = v_id;
    else
      insert into public.product_variants (product_id, size, color, sku, stock)
      values (
        v_id,
        v_row.e ->> 'size',
        v_row.e ->> 'color',
        v_row.e ->> 'sku',
        (v_row.e ->> 'stock')::integer
      );
    end if;
  end loop;

  -- Images
  delete from public.product_images
  where product_id = v_id
    and id not in (
      select (e ->> 'id')::uuid from jsonb_array_elements(p_images) e where e ->> 'id' is not null
    );

  for v_row in select e, ord from jsonb_array_elements(p_images) with ordinality as t (e, ord) loop
    if v_row.e ->> 'id' is not null then
      update public.product_images
      set url = v_row.e ->> 'url',
          alt = coalesce(v_row.e ->> 'alt', ''),
          sort_order = v_row.ord::integer
      where id = (v_row.e ->> 'id')::uuid and product_id = v_id;
    else
      insert into public.product_images (product_id, url, alt, sort_order)
      values (v_id, v_row.e ->> 'url', coalesce(v_row.e ->> 'alt', ''), v_row.ord::integer);
    end if;
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.admin_save_product(uuid, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.admin_save_product(uuid, jsonb, jsonb, jsonb) to service_role;

-- ── Customers (derived from orders) ─────────────────────────
-- One row per email with at least one paid order. Spend counts paid, processing, shipped and
-- delivered orders only. p_search must already have LIKE wildcards stripped by the caller.
create function public.admin_list_customers(
  p_search text default '',
  p_sort text default 'last_order_at',
  p_dir text default 'desc',
  p_limit integer default 15,
  p_offset integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_confirmed public.order_status[] := array['paid', 'processing', 'shipped', 'delivered']::public.order_status[];
  v_result jsonb;
begin
  with customers as (
    select
      lower(o.email) as email,
      (array_agg(o.shipping_address ->> 'fullName' order by o.created_at desc))[1] as name,
      count(*) as order_count,
      coalesce(sum(o.total_paise), 0)::bigint as total_spent_paise,
      max(o.created_at) as last_order_at
    from public.orders o
    where o.status = any (v_confirmed)
    group by lower(o.email)
  ),
  matched as (
    select * from customers c
    where p_search = ''
       or c.email ilike '%' || p_search || '%'
       or coalesce(c.name, '') ilike '%' || p_search || '%'
  )
  select jsonb_build_object(
    'total', (select count(*) from matched),
    'rows', coalesce((
      select jsonb_agg(r)
      from (
        select m.email, m.name, m.order_count, m.total_spent_paise, m.last_order_at
        from matched m
        order by
          case when p_sort = 'name' and p_dir = 'asc' then m.name end asc,
          case when p_sort = 'name' and p_dir = 'desc' then m.name end desc,
          case when p_sort = 'email' and p_dir = 'asc' then m.email end asc,
          case when p_sort = 'email' and p_dir = 'desc' then m.email end desc,
          case when p_sort = 'order_count' and p_dir = 'asc' then m.order_count end asc,
          case when p_sort = 'order_count' and p_dir = 'desc' then m.order_count end desc,
          case when p_sort = 'total_spent_paise' and p_dir = 'asc' then m.total_spent_paise end asc,
          case when p_sort = 'total_spent_paise' and p_dir = 'desc' then m.total_spent_paise end desc,
          case when p_sort = 'last_order_at' and p_dir = 'asc' then m.last_order_at end asc,
          case when p_sort = 'last_order_at' and p_dir = 'desc' then m.last_order_at end desc,
          m.email
        limit p_limit offset p_offset
      ) r
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.admin_list_customers(text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_list_customers(text, text, text, integer, integer) to service_role;
