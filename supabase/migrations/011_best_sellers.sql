-- ============================================================================
-- Misk Lume E-Commerce Platform — Best Sellers
-- Adds an admin-curated best-seller flag to products.
-- ============================================================================

alter table public.products
  add column if not exists is_bestseller boolean not null default false;

comment on column public.products.is_bestseller is 'Admin-curated flag: product appears in the Best Sellers section (homepage + /shop/best-sellers).';

create index if not exists idx_products_is_bestseller on public.products(is_bestseller);
