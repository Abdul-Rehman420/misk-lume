-- ============================================================================
-- C7: Decrement size-level stock when an order is placed
-- The 010 trigger only decremented products.stock_quantity. product_sizes rows
-- carry their own stock_quantity (and the checkout UI sells by size), so size
-- stock never decreased — making size-level inventory stale. This redefines the
-- same trigger to also decrement the matching product_sizes row when the order
-- item has a size, raising "Insufficient stock" if the size cannot be fulfilled.
-- ============================================================================
create or replace function public.decrement_stock_on_order()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id and stock_quantity >= new.quantity;

  if not found then
    raise exception 'Insufficient stock for product %', new.product_id;
  end if;

  if new.size_ml is not null then
    update public.product_sizes
    set stock_quantity = stock_quantity - new.quantity
    where product_id = new.product_id
      and size_ml = new.size_ml
      and is_active
      and stock_quantity >= new.quantity;

    if not found then
      raise exception 'Insufficient stock for product % size %', new.product_id, new.size_ml;
    end if;
  end if;

  return new;
end;
$$;
