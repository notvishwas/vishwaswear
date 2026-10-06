-- Admin dashboard numbers, computed in Postgres so they are exact and cheap.
--
-- "Confirmed" orders are those that were paid: paid, processing, shipped or delivered.
-- Cancelled, refunded and abandoned (pending_payment) orders are never counted.
-- "Today" and "this month" use Indian Standard Time.
create function public.admin_dashboard_stats(p_low_stock_threshold integer default 5)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today_start timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
  v_month_start timestamptz := date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
  v_confirmed public.order_status[] := array['paid', 'processing', 'shipped', 'delivered']::public.order_status[];
begin
  return jsonb_build_object(
    'today_orders', (
      select count(*) from public.orders
      where status = any (v_confirmed) and paid_at >= v_today_start
    ),
    'month_revenue_paise', (
      select coalesce(sum(total_paise), 0) from public.orders
      where status = any (v_confirmed) and paid_at >= v_month_start
    ),
    'total_orders', (
      select count(*) from public.orders where status = any (v_confirmed)
    ),
    'low_stock_count', (
      select count(*)
      from public.product_variants v
      join public.products p on p.id = v.product_id
      where p.is_active and v.stock <= p_low_stock_threshold
    ),
    'top_products', coalesce((
      select jsonb_agg(t)
      from (
        select
          oi.product_name as name,
          sum(oi.quantity)::integer as units,
          sum(oi.quantity::bigint * oi.unit_price_paise)::bigint as revenue_paise
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        where o.status = any (v_confirmed)
        group by oi.product_id, oi.product_name
        order by units desc, revenue_paise desc
        limit 5
      ) t
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.admin_dashboard_stats(integer) from public, anon, authenticated;
grant execute on function public.admin_dashboard_stats(integer) to service_role;
