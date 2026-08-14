-- ============================================================================
-- Remove the product-size feature entirely.
-- The store sells a single size (50ml), so per-size pricing/stock tables,
-- size_ml columns, and the size-filter count RPC are dead weight. The client
-- and admin UIs no longer reference any of these.
-- ============================================================================

-- 1) Restore the stock trigger to product-level only. The current definition
--    references order_items.size_ml and product_sizes, both of which are being
--    dropped below, so it must be redefined first.
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

  return new;
end;
$$;

-- 2) Drop the size-filter product-count RPC (no client uses it anymore).
drop function if exists public.count_filtered_products(text, text, text, integer, integer, integer[]);

-- 3) Remove size columns.
alter table public.order_items drop column if exists size_ml;
alter table public.collection_products drop column if exists size_ml;

-- 4) Drop the per-size stock/pricing table. Its RLS policies and index are
--    dropped automatically with the table.
drop table if exists public.product_sizes;
