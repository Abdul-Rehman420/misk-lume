-- ============================================================================
-- Misk Lume E-Commerce Platform — Product Sort Order
-- Lets admins control the default display order of products in the shop.
-- Applied only when the customer has not chosen a sort / filter.
-- ============================================================================

alter table public.products
  add column if not exists sort_order integer not null default 0;

comment on column public.products.sort_order is 'Admin-set display position in the shop (lower appears first). Ignored when the customer applies a sort.';

create index if not exists idx_products_active_sort_order on public.products(is_active, sort_order);
