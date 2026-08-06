-- ============================================================================
-- H1: Make stock decrement trigger safe — only decrement if stock >= quantity
-- SECURITY DEFINER: the trigger fires from a customer session, but RLS forbids
-- customers from updating products, so without definer rights the UPDATE would
-- affect 0 rows and every order would report "Insufficient stock".
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

  return new;
end;
$$;

-- ============================================================================
-- H1: Atomic stock decrement RPC for use from application code
-- Takes a JSON array of {product_id: uuid, quantity: int}
-- Decrements each product's stock atomically, returns which items failed
-- ============================================================================
create or replace function public.decrement_products_stock(items jsonb)
returns jsonb
language plpgsql
as $$
declare
  item record;
  failed_items jsonb := '[]'::jsonb;
begin
  for item in select * from jsonb_to_recordset(items) as x(product_id uuid, quantity int)
  loop
    update public.products
    set stock_quantity = stock_quantity - item.quantity
    where id = item.product_id and stock_quantity >= item.quantity;

    if not found then
      failed_items := failed_items || jsonb_build_object(
        'product_id', item.product_id,
        'quantity', item.quantity
      );
    end if;
  end loop;

  return jsonb_build_object(
    'success', jsonb_array_length(failed_items) = 0,
    'failed_items', failed_items
  );
end;
$$;
