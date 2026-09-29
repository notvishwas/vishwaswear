-- Payments: idempotent order creation and atomic "mark paid + decrement stock".

alter table public.orders
  add column paid_at timestamptz,
  -- Set when a payment needs a human: e.g. 'insufficient_stock' or 'payment_failed: <reason>'.
  add column payment_issue text,
  -- Ties repeated submits of the same checkout attempt to one order.
  add column idempotency_key text;

-- Only one open (unpaid) order per checkout attempt. Cancelled or paid orders may share a key.
create unique index orders_open_idempotency_key_idx
  on public.orders (idempotency_key)
  where status = 'pending_payment' and idempotency_key is not null;

create index orders_idempotency_key_idx on public.orders (idempotency_key);

-- Marks an order paid and takes its stock in one transaction.
-- Called by both the browser verify step and the Razorpay webhook, in any order and any number of
-- times: the row lock plus the status check make it safe to repeat. Stock is only ever taken once.
--
-- Returns one of:
--   'paid'               newly marked paid, stock decremented
--   'already_paid'       nothing to do (a repeat call)
--   'insufficient_stock' payment recorded but stock ran out; order stays pending for manual refund
--   'amount_mismatch'    the reported amount differs from the order total
--   'invalid_state'      order was cancelled or refunded
--   'not_found'          no order for that Razorpay order id
create function public.mark_order_paid(
  p_razorpay_order_id text,
  p_payment_id text,
  p_amount_paise integer default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_item record;
  v_updated integer;
begin
  select * into v_order
  from public.orders
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    return 'not_found';
  end if;

  if v_order.status in ('paid', 'processing', 'shipped', 'delivered') then
    return 'already_paid';
  end if;

  if v_order.status <> 'pending_payment' then
    return 'invalid_state';
  end if;

  if p_amount_paise is not null and p_amount_paise <> v_order.total_paise then
    return 'amount_mismatch';
  end if;

  begin
    -- Fixed lock order prevents deadlocks between two orders sharing variants.
    for v_item in
      select variant_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = v_order.id and variant_id is not null
      group by variant_id
      order by variant_id
    loop
      update public.product_variants
      set stock = stock - v_item.quantity
      where id = v_item.variant_id and stock >= v_item.quantity;

      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        raise exception 'insufficient_stock' using errcode = 'P0001';
      end if;
    end loop;

    update public.orders
    set status = 'paid',
        razorpay_payment_id = p_payment_id,
        paid_at = now(),
        payment_issue = null
    where id = v_order.id;

    return 'paid';
  exception
    when sqlstate 'P0001' then
      -- The block above is rolled back, so no partial stock was taken.
      update public.orders
      set razorpay_payment_id = p_payment_id,
          payment_issue = 'insufficient_stock'
      where id = v_order.id;
      return 'insufficient_stock';
  end;
end;
$$;

revoke execute on function public.mark_order_paid(text, text, integer) from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, text, integer) to service_role;
