-- Efficient product count with optional size filter (avoids loading all rows client-side)
create or replace function count_filtered_products(
  p_category text default null,
  p_gender text default null,
  p_search text default null,
  p_min_price int default null,
  p_max_price int default null,
  p_sizes int[] default null
)
returns int
language sql
stable
as $$
  with base as (
    select p.id
    from products p
    where p.is_active = true
      and (p_category is null or p.category_id in (select id from categories where slug = p_category))
      and (p_gender is null or p.gender = p_gender)
      and (p_search is null or p.name ilike '%' || p_search || '%' or p.description ilike '%' || p_search || '%')
      and (p_min_price is null or p.price >= p_min_price)
      and (p_max_price is null or p.price <= p_max_price)
  )
  select count(*)::int
  from base b
  where (p_sizes is null or exists (
    select 1 from product_sizes ps
    where ps.product_id = b.id and ps.size_ml = any(p_sizes)
  ));
$$;
