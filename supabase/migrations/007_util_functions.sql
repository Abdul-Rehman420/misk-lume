-- Atomic increment for discount code usage
create or replace function increment_discount_usage(code_text text)
returns void
language sql
as $$
  update discount_codes set used_count = used_count + 1 where code = code_text;
$$;

-- Check product stock
create or replace function check_stock(p_id uuid, p_quantity integer)
returns boolean
language sql
as $$
  select exists (
    select 1 from products where id = p_id and stock_quantity >= p_quantity and stock_quantity > 0
  );
$$;
