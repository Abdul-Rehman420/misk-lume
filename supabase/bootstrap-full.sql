-- ============================================================
-- Misk Lume — FULL DATABASE BOOTSTRAP (migrations 001-015)
-- Paste this entire file into Supabase Dashboard > SQL Editor
-- and click Run. Run it once on the NEW project only.
-- ============================================================

-- ========== MIGRATION 001_initial_schema.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Initial Schema
-- PostgreSQL / Supabase migration
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- PROFILES
-- Extends Supabase auth.users with application-specific profile data.
-- ============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application user profiles linked to Supabase auth.users';
comment on column public.profiles.role is 'Access level: customer (default), admin, or super_admin';

-- ============================================================================
-- CATEGORIES
-- Product categories (e.g. Men, Women, Unisex, Attar).
-- ============================================================================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.categories is 'Product categories for browsing & filtering';

-- ============================================================================
-- PRODUCTS
-- Core product catalogue. Prices stored as whole integer PKR (no decimals).
-- ============================================================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  category_id uuid references public.categories(id) on delete set null,
  gender text check (gender in ('men', 'women', 'unisex')),
  price integer not null,
  sale_price integer,
  sku text unique,
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  badge text check (badge in ('new', 'sale', 'out_of_stock')),
  image_url text,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'All sellable perfume & attar products';
comment on column public.products.price is 'Price in PKR (stored as whole integer, no decimals)';

-- ============================================================================
-- PRODUCT IMAGES
-- Multiple images per product for galleries / thumbnails.
-- ============================================================================
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  constraint one_primary_per_product unique (product_id, is_primary)
);

comment on table public.product_images is 'Gallery images associated with each product';

-- ============================================================================
-- PRODUCT SIZES
-- Size variants (e.g. 6ml, 12ml, 25ml) with their own pricing & stock.
-- ============================================================================
create table public.product_sizes (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  size_ml integer not null,
  price integer not null,
  sale_price integer,
  stock_quantity integer not null default 0,
  sku text,
  is_active boolean not null default true
);

comment on table public.product_sizes is 'Size variants for each product with independent pricing/stock';

-- ============================================================================
-- FRAGRANCE NOTES
-- Olfactory pyramid (top / middle / base notes) per product.
-- ============================================================================
create table public.fragrance_notes (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  note_type text not null check (note_type in ('top', 'middle', 'base')),
  name text not null,
  description text
);

comment on table public.fragrance_notes is 'Olfactory note pyramid for each fragrance';

-- ============================================================================
-- COLLECTIONS
-- Curated sets / gift boxes combining multiple products.
-- ============================================================================
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  price integer,
  original_price integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.collections is 'Curated product sets & gift boxes';

-- ============================================================================
-- COLLECTION PRODUCTS
-- Many-to-many join between collections and products.
-- ============================================================================
create table public.collection_products (
  id uuid default uuid_generate_v4() primary key,
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size_ml integer
);

comment on table public.collection_products is 'Which products (and sizes) belong to each collection';

-- ============================================================================
-- ORDERS
-- Customer orders with shipping, payment, and tracking details.
-- ============================================================================
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal integer not null,
  shipping_cost integer not null default 200,
  discount_amount integer not null default 0,
  discount_code text,
  total integer not null,
  payment_method text check (payment_method in ('cod', 'bank_transfer', 'jazzcash', 'easypaisa')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  shipping_first_name text,
  shipping_last_name text,
  shipping_email text,
  shipping_phone text,
  shipping_address text,
  shipping_city text,
  shipping_province text,
  shipping_postal_code text,
  delivery_instructions text,
  tracking_number text,
  shipping_provider text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Customer order records including shipping & payment info';

-- ============================================================================
-- ORDER ITEMS
-- Line items within each order (snapshot of product at time of purchase).
-- ============================================================================
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  size_ml integer,
  quantity integer not null default 1,
  unit_price integer not null,
  total_price integer not null
);

comment on table public.order_items is 'Line items snapshot for each order';

-- ============================================================================
-- WISHLIST
-- Per-user product wishlist (unique per user + product).
-- ============================================================================
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

comment on table public.wishlist is 'User wishlist items (unique per user/product pair)';

-- ============================================================================
-- REVIEWS
-- Product reviews & ratings from customers.
-- ============================================================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  text text,
  is_verified boolean not null default false,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.reviews is 'Customer product reviews with ratings';

-- ============================================================================
-- BLOG POSTS
-- Content / journal entries for the Misk Lume blog.
-- ============================================================================
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  category text,
  author text,
  image_url text,
  is_published boolean not null default false,
  views integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.blog_posts is 'Blog / journal content entries';

-- ============================================================================
-- DISCOUNT CODES
-- Promotional codes for percentage or fixed-amount discounts.
-- ============================================================================
create table public.discount_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value integer not null,
  min_order integer not null default 0,
  usage_limit integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.discount_codes is 'Promotional / discount codes';

-- ============================================================================
-- ACTIVITY LOG
-- Audit trail for admin-facing events (orders, reviews, user actions).
-- ============================================================================
create table public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

comment on table public.activity_log is 'Audit trail for admin events & user actions';

-- ============================================================================
-- INDEXES
-- Performance indexes for frequently queried columns.
-- ============================================================================
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_is_active on public.categories(is_active);

create index idx_products_slug on public.products(slug);
create index idx_products_category_id on public.products(category_id);
create index idx_products_gender on public.products(gender);
create index idx_products_is_active on public.products(is_active);
create index idx_products_is_featured on public.products(is_featured);
create index idx_products_price on public.products(price);

create index idx_product_images_product_id on public.product_images(product_id);
create index idx_product_sizes_product_id on public.product_sizes(product_id);
create index idx_fragrance_notes_product_id on public.fragrance_notes(product_id);

create index idx_collections_slug on public.collections(slug);
create index idx_collection_products_collection_id on public.collection_products(collection_id);
create index idx_collection_products_product_id on public.collection_products(product_id);

create index idx_orders_order_number on public.orders(order_number);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment_status on public.orders(payment_status);
create index idx_orders_created_at on public.orders(created_at);

create index idx_order_items_order_id on public.order_items(order_id);
create index idx_wishlist_user_id on public.wishlist(user_id);
create index idx_wishlist_product_id on public.wishlist(product_id);

create index idx_reviews_product_id on public.reviews(product_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_is_approved on public.reviews(is_approved);

create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_blog_posts_is_published on public.blog_posts(is_published);
create index idx_blog_posts_category on public.blog_posts(category);
create index idx_blog_posts_published_at on public.blog_posts(published_at);

create index idx_discount_codes_code on public.discount_codes(code);

create index idx_activity_log_user_id on public.activity_log(user_id);
create index idx_activity_log_entity_type on public.activity_log(entity_type);
create index idx_activity_log_created_at on public.activity_log(created_at);


-- ========== MIGRATION 002_rls_policies.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Row Level Security Policies
-- Enables RLS on every table and defines granular access rules.
-- ============================================================================

-- Helper: Returns true when the requesting user is an admin or super_admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

-- Helper: Returns true when the requesting user is the owner of the row
-- (matching by a user_id column).
create or replace function public.is_owner(user_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select auth.uid() = user_id;
$$;

-- ============================================================================
-- Enable RLS on every table
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.product_images      enable row level security;
alter table public.product_sizes       enable row level security;
alter table public.fragrance_notes     enable row level security;
alter table public.collections         enable row level security;
alter table public.collection_products enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.wishlist            enable row level security;
alter table public.reviews             enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.discount_codes      enable row level security;
alter table public.activity_log        enable row level security;

-- ============================================================================
-- PROFILES
-- Anyone can read public profile data.  Users can update their own.
-- Only admins can insert/update roles.
-- ============================================================================
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- ============================================================================
-- CATEGORIES
-- Public read access; admin write access.
-- ============================================================================
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin());

create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

-- ============================================================================
-- PRODUCTS
-- Public read access (active products); admin write access.
-- ============================================================================
create policy "Active products are publicly readable"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- ============================================================================
-- PRODUCT IMAGES
-- Public read access; admin write access (cascading from products).
-- ============================================================================
create policy "Product images are publicly readable"
  on public.product_images for select
  using (true);

create policy "Admins can manage product images"
  on public.product_images for insert
  with check (public.is_admin());

create policy "Admins can update product images"
  on public.product_images for update
  using (public.is_admin());

create policy "Admins can delete product images"
  on public.product_images for delete
  using (public.is_admin());

-- ============================================================================
-- PRODUCT SIZES
-- Public read access; admin write access.
-- ============================================================================
create policy "Product sizes are publicly readable"
  on public.product_sizes for select
  using (true);

create policy "Admins can manage product sizes"
  on public.product_sizes for insert
  with check (public.is_admin());

create policy "Admins can update product sizes"
  on public.product_sizes for update
  using (public.is_admin());

create policy "Admins can delete product sizes"
  on public.product_sizes for delete
  using (public.is_admin());

-- ============================================================================
-- FRAGRANCE NOTES
-- Public read access; admin write access.
-- ============================================================================
create policy "Fragrance notes are publicly readable"
  on public.fragrance_notes for select
  using (true);

create policy "Admins can manage fragrance notes"
  on public.fragrance_notes for insert
  with check (public.is_admin());

create policy "Admins can update fragrance notes"
  on public.fragrance_notes for update
  using (public.is_admin());

create policy "Admins can delete fragrance notes"
  on public.fragrance_notes for delete
  using (public.is_admin());

-- ============================================================================
-- COLLECTIONS
-- Public read access; admin write access.
-- ============================================================================
create policy "Collections are publicly readable"
  on public.collections for select
  using (true);

create policy "Admins can manage collections"
  on public.collections for insert
  with check (public.is_admin());

create policy "Admins can update collections"
  on public.collections for update
  using (public.is_admin());

create policy "Admins can delete collections"
  on public.collections for delete
  using (public.is_admin());

-- ============================================================================
-- COLLECTION PRODUCTS
-- Public read access; admin write access.
-- ============================================================================
create policy "Collection products are publicly readable"
  on public.collection_products for select
  using (true);

create policy "Admins can manage collection products"
  on public.collection_products for insert
  with check (public.is_admin());

create policy "Admins can update collection products"
  on public.collection_products for update
  using (public.is_admin());

create policy "Admins can delete collection products"
  on public.collection_products for delete
  using (public.is_admin());

-- ============================================================================
-- ORDERS
-- Users can see their own orders.  Admins can see all orders.
-- Authenticated users can create orders.
-- ============================================================================
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pending orders"
  on public.orders for update
  using (auth.uid() = user_id and status = 'pending');

create policy "Admins can update any order"
  on public.orders for update
  using (public.is_admin());

create policy "Admins can delete orders"
  on public.orders for delete
  using (public.is_admin());

-- ============================================================================
-- ORDER ITEMS
-- Visible to the owning user or admin.
-- ============================================================================
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authenticated users can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage order items"
  on public.order_items for update
  using (public.is_admin());

create policy "Admins can delete order items"
  on public.order_items for delete
  using (public.is_admin());

-- ============================================================================
-- WISHLIST
-- Users manage their own wishlist.  Admins can view all.
-- ============================================================================
create policy "Users can view their own wishlist"
  on public.wishlist for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can add to their own wishlist"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist"
  on public.wishlist for delete
  using (auth.uid() = user_id);

create policy "Admins can delete any wishlist item"
  on public.wishlist for delete
  using (public.is_admin());

-- ============================================================================
-- REVIEWS
-- Public can read approved reviews.  Authenticated users can create reviews.
-- Users can edit/delete their own reviews.  Admins can approve/delete any.
-- ============================================================================
create policy "Approved reviews are publicly readable"
  on public.reviews for select
  using (is_approved = true or auth.uid() = user_id or public.is_admin());

create policy "Users can create reviews as themselves"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and is_approved = false
  );

create policy "Users can update their own unapproved reviews"
  on public.reviews for update
  using (auth.uid() = user_id and is_approved = false);

create policy "Admins can update any review"
  on public.reviews for update
  using (public.is_admin());

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

create policy "Admins can delete any review"
  on public.reviews for delete
  using (public.is_admin());

-- ============================================================================
-- BLOG POSTS
-- Published posts are public.  Admins can manage all.
-- ============================================================================
create policy "Published blog posts are publicly readable"
  on public.blog_posts for select
  using (is_published = true or public.is_admin());

create policy "Admins can create blog posts"
  on public.blog_posts for insert
  with check (public.is_admin());

create policy "Admins can update blog posts"
  on public.blog_posts for update
  using (public.is_admin());

create policy "Admins can delete blog posts"
  on public.blog_posts for delete
  using (public.is_admin());

-- ============================================================================
-- DISCOUNT CODES
-- Public can read (to validate codes at checkout).  Admins can manage.
-- ============================================================================
create policy "Discount codes are publicly readable"
  on public.discount_codes for select
  using (true);

create policy "Admins can manage discount codes"
  on public.discount_codes for insert
  with check (public.is_admin());

create policy "Admins can update discount codes"
  on public.discount_codes for update
  using (public.is_admin());

create policy "Admins can delete discount codes"
  on public.discount_codes for delete
  using (public.is_admin());

-- ============================================================================
-- ACTIVITY LOG
-- Read-only for admins; insert-only via triggers for authenticated users.
-- ============================================================================
create policy "Admins can view activity log"
  on public.activity_log for select
  using (public.is_admin());

create policy "Triggers and authenticated users can insert activity log"
  on public.activity_log for insert
  with check (auth.role() = 'authenticated');


-- ========== MIGRATION 003_functions_and_triggers.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Functions & Triggers
-- ============================================================================

-- ============================================================================
-- 1. Auto-update `updated_at` columns
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables with an updated_at column
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger set_updated_at_orders
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger set_updated_at_blog_posts
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. Auto-create profile on user signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 3. Generate sequential order number
-- ============================================================================
create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns text
language sql
stable
as $$
  select 'ML-' || to_char(now(), 'YYYY-MM') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

-- ============================================================================
-- 4. Assign order number on order insert
-- ============================================================================
create or replace function public.assign_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;

create trigger before_insert_order_assign_number
  before insert on public.orders
  for each row execute function public.assign_order_number();

-- ============================================================================
-- 5. Update product rating when a review is inserted, updated, or deleted
-- ============================================================================
create or replace function public.update_product_rating()
returns trigger
language plpgsql
as $$
declare
  target_product_id uuid;
begin
  if tg_op = 'DELETE' then
    target_product_id := old.product_id;
  else
    target_product_id := new.product_id;
  end if;

  update public.products
  set
    rating = coalesce(
      (select round(avg(rating::numeric), 2)
         from public.reviews
        where product_id = target_product_id
          and is_approved = true),
      0
    ),
    review_count = (
      select count(*)
        from public.reviews
       where product_id = target_product_id
         and is_approved = true
    )
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

create trigger after_review_insert_update_rating
  after insert on public.reviews
  for each row
  when (new.is_approved = true)
  execute function public.update_product_rating();

create trigger after_review_update_rating
  after update on public.reviews
  for each row
  when (old.is_approved is distinct from new.is_approved)
  execute function public.update_product_rating();

create trigger after_review_delete_rating
  after delete on public.reviews
  for each row
  execute function public.update_product_rating();

-- ============================================================================
-- 6. Activity log helpers
-- ============================================================================
create or replace function public.log_activity(
  p_user_id uuid,
  p_action text,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_details jsonb default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.activity_log (user_id, action, entity_type, entity_id, details)
  values (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
end;
$$;

-- ============================================================================
-- 7. Auto-log order status changes
-- ============================================================================
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into public.activity_log (user_id, action, entity_type, entity_id, details)
    values (
      coalesce(new.user_id, auth.uid()),
      'order_status_changed',
      'order',
      new.id,
      jsonb_build_object(
        'from', old.status,
        'to', new.status,
        'order_number', new.order_number
      )
    );
  end if;
  return new;
end;
$$;

create trigger on_order_status_change
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.log_order_status_change();

-- ============================================================================
-- 8. Auto-log new orders
-- ============================================================================
create or replace function public.log_new_order()
returns trigger
language plpgsql
as $$
begin
  insert into public.activity_log (user_id, action, entity_type, entity_id, details)
  values (
    new.user_id,
    'order_created',
    'order',
    new.id,
    jsonb_build_object(
      'order_number', new.order_number,
      'total', new.total,
      'payment_method', new.payment_method
    )
  );
  return new;
end;
$$;

create trigger on_new_order
  after insert on public.orders
  for each row execute function public.log_new_order();

-- ============================================================================
-- 9. Decrement stock on order placement
-- ============================================================================
create or replace function public.decrement_stock_on_order()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;

  return new;
end;
$$;

create trigger on_order_item_insert
  after insert on public.order_items
  for each row execute function public.decrement_stock_on_order();

-- ============================================================================
-- 10. Restore stock on order cancellation
-- SECURITY DEFINER so cancellation (by customer or admin) can update products
-- regardless of RLS on the calling session.
-- ============================================================================
create or replace function public.restore_stock_on_cancellation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status != 'cancelled' then
    update public.products p
    set stock_quantity = p.stock_quantity + oi.quantity
    from public.order_items oi
    where oi.order_id = new.id
      and p.id = oi.product_id;
  end if;
  return new;
end;
$$;

create trigger on_order_cancelled
  after update of status on public.orders
  for each row
  when (new.status = 'cancelled' and old.status is distinct from 'cancelled')
  execute function public.restore_stock_on_cancellation();


-- ========== MIGRATION 004_seed_data.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Seed Data (Development)
-- ============================================================================

-- ============================================================================
-- Categories
-- ============================================================================
insert into public.categories (name, slug, description, sort_order, image_url) values
  ('Men',     'men',     'Bold, woody, and sophisticated fragrances for men',     1, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80'),
  ('Women',   'women',   'Elegant, floral, and captivating fragrances for women',  2, 'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=600&q=80'),
  ('Unisex',  'unisex',  'Universal scents crafted for every soul',               3, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80'),
  ('Attar',   'attar',   'Traditional concentrated oil-based perfumes',           4, 'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=600&q=80');

-- ============================================================================
-- Collections
-- ============================================================================
insert into public.collections (name, slug, description, image_url, price, original_price, sort_order) values
  (
    'The Noir Trio',
    'noir-trio',
    'Three of our most iconic fragrances â€” Noir Oud, Noir Saffron, and Noir Musk â€” presented together in an exclusive gift box. A complete scent wardrobe for the modern connoisseur.',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    9800, 12300, 1
  ),
  (
    'Rose Garden Set',
    'rose-garden',
    'A curated trio of our finest rose-based fragrances. From the dewy freshness of Rose Dawn to the deep richness of Velvet Rose, this set celebrates the world''s most beloved flower.',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    8500, 10700, 2
  ),
  (
    'The Discovery Kit',
    'discovery-kit',
    'New to Misk Lume? This kit includes six 2ml samples of our best-selling fragrances so you can find your signature scent before committing to a full bottle.',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    3500, null, 3
  ),
  (
    'The Luxe Gift Box',
    'luxe-gift',
    'The ultimate gifting experience. A hand-crafted wooden box containing a full-size fragrance, a travel spray, and a scented candle â€” all wrapped in our signature packaging.',
    'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=800&q=80',
     6500, null, 4
  );

-- ============================================================================
-- Blog Posts
-- ============================================================================
insert into public.blog_posts (title, slug, excerpt, content, category, author, image_url, is_published, views, published_at) values
  (
    'The Art of Layering Fragrances',
    'layering-fragrances',
    'Master the technique of combining scents to create a unique olfactory signature that''s entirely your own.',
    '## The Art of Layering Fragrances\n\nLayering fragrances is an art form that allows you to create a truly unique scent signature. By combining different perfumes, you can craft a fragrance that evolves throughout the day and reflects your personality.\n\n### Start with a Base\n\nBegin with a neutral or complementary base fragrance. This could be a subtle musk or a light citrus that provides a foundation for bolder notes to build upon.\n\n### Choose Complementary Notes\n\nLook for fragrances with complementary notes. Woody bases pair beautifully with floral or citrus top notes. Oriental scents work well with fresh, clean fragrances.\n\n### Layer from Heaviest to Lightest\n\nApply your heaviest, most intense fragrance first, then layer lighter scents on top. This allows each layer to shine while creating a balanced overall composition.\n\n### Experiment\n\nDon''t be afraid to experiment. Some of the most beautiful fragrance combinations come from unexpected pairings.',
    'Rituals',
    'Misk Lume',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    true, 1240, '2026-07-10 00:00:00+05'
  ),
  (
    'Oud: The Liquid Gold of Perfumery',
    'oud-liquid-gold',
    'Discover why oud has been treasured for centuries and what makes our sourcing process different.',
    '## Oud: The Liquid Gold of Perfumery\n\nOud, also known as agarwood, is one of the most precious and sought-after ingredients in perfumery. Its rich, complex aroma has been treasured for thousands of years.\n\n### What Makes Oud So Special?\n\nOud is formed when the agarwood tree becomes infected with a specific type of mold. In response, the tree produces a dark, fragrant resin that becomes increasingly aromatic over decades.\n\n### Our Sourcing Process\n\nAt Misk Lume, we source our oud from sustainable plantations in Assam and Cambodia. We work directly with local harvesters to ensure ethical practices and the highest quality.\n\n### The Scent Profile\n\nQuality oud has a complex profile that can include notes of leather, smoke, wood, and even subtle sweetness. It''s a fragrance that demands attention and rewards patience.',
    'Ingredients',
    'Misk Lume',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80',
    true, 980, '2026-06-28 00:00:00+05'
  ),
  (
    'Your Guide to Attar Oils',
    'attar-oils-guide',
    'Everything you need to know about traditional attar oils, from application techniques to storage.',
    '## Your Guide to Attar Oils\n\nAttar oils are traditional perfume oils that have been crafted for centuries in the Middle East and South Asia. These concentrated oil-based fragrances offer a unique olfactory experience.\n\n### What Are Attars?\n\nAttars are natural perfume oils made through steam distillation of botanical materials. Unlike alcohol-based perfumes, attars are pure oil concentrates that last significantly longer on the skin.\n\n### Application Tips\n\nApply attar oil to pulse points â€” wrists, behind the ears, and the base of the throat. The warmth of these areas helps the fragrance develop and project beautifully.\n\n### Storage\n\nStore attar oils in a cool, dark place away from direct sunlight. Properly stored, attars can last for decades and even improve with age.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=800&q=80',
    true, 756, '2026-06-15 00:00:00+05'
  ),
  (
    'Understanding Fragrance Notes: Top, Heart & Base',
    'fragrance-notes',
    'A beginner''s guide to the architecture of perfume and how scent evolves on your skin over time.',
    '## Understanding Fragrance Notes\n\nEvery perfume is composed of three layers of notes that unfold over time: the top notes, heart notes, and base notes. Understanding this architecture helps you appreciate the craft behind each fragrance.\n\n### Top Notes (The Opening)\n\nTop notes are the first impression â€” light, volatile molecules that evaporate quickly. Citrus, light fruits, and fresh herbs are common top notes. They last about 15-30 minutes.\n\n### Heart Notes (The Soul)\n\nHeart notes emerge as the top notes fade. These form the core of the fragrance and last 2-4 hours. Floral, spicy, and fruity notes are typical heart notes.\n\n### Base Notes (The Foundation)\n\nBase notes are the foundation â€” rich, heavy molecules that last the longest. Woods, resins, musks, and vanillas provide depth and longevity, lasting 6+ hours.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    true, 2100, '2026-06-01 00:00:00+05'
  ),
  (
    'The History of Oud: From Ancient Temples to Modern Perfumery',
    'history-of-oud',
    'Oud has been treasured for thousands of years, from the incense-filled temples of ancient Egypt to the sophisticated ateliers of modern perfumery.',
    '## The History of Oud\n\nOud has been treasured for thousands of years, from the incense-filled temples of ancient Egypt to the sophisticated ateliers of modern perfumery. This rare ingredient, born from the heart of the agarwood tree, carries with it centuries of tradition, spirituality, and unmatched olfactory richness.\n\n### Ancient Origins\n\nThe use of oud dates back over 3,000 years. In ancient Egypt, it was used in religious ceremonies and burial rites. In Ayurvedic tradition, oud was prized for its medicinal properties.\n\n### The Silk Road\n\nOud traveled along the Silk Road, becoming a prized commodity in the courts of emperors and kings. It was often worth more than gold.\n\n### Modern Perfumery\n\nToday, oud is experiencing a renaissance in Western perfumery. Master perfumers are incorporating this ancient ingredient into modern compositions, creating fragrances that bridge tradition and innovation.',
    'Ingredients',
    'Misk Lume',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    true, 3200, '2026-05-15 00:00:00+05'
  ),
  (
    'Choosing the Perfect Winter Fragrance',
    'winter-fragrance',
    'Discover rich, warming scents that complement the colder months and leave a lasting impression.',
    '## Choosing the Perfect Winter Fragrance\n\nWinter is the season for rich, enveloping fragrances. The cold weather calls for scents that warm the soul and leave a lasting impression.\n\n### Look for Warm Notes\n\nWinter fragrances typically feature warm notes like amber, vanilla, oud, leather, and spices. These ingredients create a cozy, comforting aura.\n\n### Consider Concentration\n\nIn winter, you can wear higher concentrations like parfum or extrait de parfum. The cold weather slows evaporation, allowing heavier formulations to perform beautifully.\n\n### Our Top Picks\n\nFor winter, we recommend Noir Oud for its deep, smoky warmth, Saffron Ember for its rich spice, and Tobacco Roi for its luxurious, honeyed tobacco.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=800&q=80',
    true, 645, '2026-04-20 00:00:00+05'
  );

-- ============================================================================
-- Discount Codes
-- ============================================================================
insert into public.discount_codes (code, type, value, min_order, usage_limit, is_active, expires_at) values
  ('RITUAL15',  'percentage', 15, 0,    100, true, '2027-12-31 23:59:59+05'),
  ('WELCOME10', 'percentage', 10, 2000, 500, true, '2027-12-31 23:59:59+05');

-- ============================================================================
-- Reviews
-- ============================================================================
-- No seeded reviews. All reviews are written by real authenticated customers
-- through the storefront and approved by admins. Ratings and review counts are
-- kept in sync automatically by the update_product_rating trigger.


-- ========== MIGRATION 005_security_and_fixes.sql ==========
-- ============================================================================
-- Migration 005: Security hardening, bug fixes, and cleanup
-- ============================================================================

-- ============================================================================
-- 1. Remove dead order number trigger (API generates order numbers)
-- ============================================================================
drop trigger if exists before_insert_order_assign_number on public.orders;
drop function if exists public.assign_order_number();
drop function if exists public.generate_order_number();
drop sequence if exists public.order_number_seq;

-- ============================================================================
-- 2. Fix discount_codes RLS â€” hide internals from unauthenticated users
-- ============================================================================
drop policy if exists "Discount codes are viewable by everyone" on public.discount_codes;
drop policy if exists "Discount codes are publicly readable" on public.discount_codes;
drop policy if exists "Active discount codes are viewable by everyone" on public.discount_codes;
drop policy if exists "Admins can manage discount codes" on public.discount_codes;

create policy "Admins can view discount codes"
  on public.discount_codes for select
  using (public.is_admin());

create policy "Admins can manage discount codes"
  on public.discount_codes for all
  using (public.is_admin());


-- ========== MIGRATION 006_rate_limit.sql ==========
-- Rate limiting table for API endpoint protection
create table if not exists rate_limits (
  id bigint generated always as identity primary key,
  key text not null,
  count integer not null default 1,
  reset_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_rate_limits_key on rate_limits(key);
create index if not exists idx_rate_limits_reset_at on rate_limits(reset_at);

-- Cleanup old entries periodically
create or replace function cleanup_rate_limits() returns void
language sql as $$
  delete from rate_limits where reset_at < now();
$$;


-- ========== MIGRATION 007_util_functions.sql ==========
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


-- ========== MIGRATION 008_store_settings.sql ==========
-- Store settings key-value table
create table if not exists store_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

insert into store_settings (key, value) values
  ('store_name', 'Misk Lume'),
  ('store_description', 'Luxury fragrances crafted with the finest ingredients from the heart of the East.'),
  ('contact_email', 'info@misklume.com'),
  ('contact_phone', '+92 300 1234567'),
  ('shipping_rate', '200'),
  ('free_shipping_threshold', '8000'),
  ('delivery_estimate', '4-5 business days'),
  ('bank_name', 'Meezan Bank'),
  ('account_title', 'Misk Lume (Pvt) Ltd'),
  ('account_number', '0123-0101-2345678-01'),
  ('iban', 'PK90MEZN0001230101234567801')
on conflict (key) do nothing;

-- MIGRATION 016_store_settings_rls_and_profiles.sql
-- RLS for store_settings: public read (checkout renders bank details), admin writes only.
alter table public.store_settings enable row level security;

create policy "Store settings are publicly readable"
  on public.store_settings for select
  using (true);

create policy "Admins can insert store settings"
  on public.store_settings for insert
  with check (public.is_admin());

create policy "Admins can update store settings"
  on public.store_settings for update
  using (public.is_admin());

create policy "Admins can delete store settings"
  on public.store_settings for delete
  using (public.is_admin());




-- ========== MIGRATION 009_product_count_rpc.sql ==========
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


-- ========== MIGRATION 010_atomic_stock_and_auth.sql ==========
-- ============================================================================
-- H1: Make stock decrement trigger safe â€” only decrement if stock >= quantity
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


-- ========== MIGRATION 011_best_sellers.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Best Sellers
-- Adds an admin-curated best-seller flag to products.
-- ============================================================================

alter table public.products
  add column if not exists is_bestseller boolean not null default false;

comment on column public.products.is_bestseller is 'Admin-curated flag: product appears in the Best Sellers section (homepage + /shop/best-sellers).';

create index if not exists idx_products_is_bestseller on public.products(is_bestseller);


-- ========== MIGRATION 012_product_sort_order.sql ==========
-- ============================================================================
-- Misk Lume E-Commerce Platform â€” Product Sort Order
-- Lets admins control the default display order of products in the shop.
-- Applied only when the customer has not chosen a sort / filter.
-- ============================================================================

alter table public.products
  add column if not exists sort_order integer not null default 0;

comment on column public.products.sort_order is 'Admin-set display position in the shop (lower appears first). Ignored when the customer applies a sort.';

create index if not exists idx_products_active_sort_order on public.products(is_active, sort_order);


-- ========== MIGRATION 013_rate_limit_fix.sql ==========
-- ============================================================================
-- C2: Fix rate limiting (was silently failing open)
-- Problems:
--   1) rate-limit.ts upserted with onConflict: "key", but `key` only had a
--      non-unique index (idx_rate_limits_key), so every upsert errored and
--      rate limiting silently failed open â€” all endpoints were unthrottled.
--   2) rate_limits had no RLS, so anyone with the public anon key could read,
--      write, or delete rate-limit rows via the REST API.
-- Fix:
--   - Dedupe existing rows, then add a unique constraint on `key`.
--   - Enable RLS with no policies so clients can no longer touch the table.
--   - Move read/write logic into one atomic security definer RPC, executed by
--     the app. A single INSERT..ON CONFLICT statement removes the
--     select-then-update race the old code had.
-- ============================================================================

-- 1) Dedupe (keep the newest row per key) before the unique constraint
delete from rate_limits a
using rate_limits b
where a.key = b.key and a.id < b.id;

-- 2) Unique constraint on key
alter table rate_limits
  add constraint rate_limits_key_unique unique (key);

-- 3) Lock the table down. RLS on with no policies = anon/authenticated can no
--    longer select/insert/update/delete rows directly.
alter table rate_limits enable row level security;

-- 4) Atomic rate-limit RPC.
--    Fresh or expired key  -> insert count = 1, success
--    Existing, within window -> count + 1, success while count <= limit
create or replace function public.apply_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms bigint
) returns table (success boolean, remaining integer)
language sql security definer set search_path = ''
as $$
  with applied as (
    insert into public.rate_limits (key, count, reset_at)
    values (p_key, 1, now() + (p_window_ms * interval '0.001 seconds'))
    on conflict (key) do update set
      count = case
        when rate_limits.reset_at < now() then 1
        else rate_limits.count + 1
      end,
      reset_at = case
        when rate_limits.reset_at < now() then excluded.reset_at
        else rate_limits.reset_at
      end
    returning count
  )
  select
    (select count from applied) <= p_limit as success,
    greatest(p_limit - (select count from applied), 0)::integer as remaining;
$$;

-- Cleanup still needs to bypass RLS now that it is enabled
create or replace function public.cleanup_rate_limits() returns void
language sql security definer set search_path = ''
as $$
  delete from public.rate_limits where reset_at < now();
$$;

-- Function execution is granted separately from table RLS
grant execute on function public.apply_rate_limit(text, integer, bigint) to anon, authenticated;
grant execute on function public.cleanup_rate_limits() to anon, authenticated;


-- ========== MIGRATION 014_size_stock_trigger.sql ==========
-- ============================================================================
-- C7: Decrement size-level stock when an order is placed
-- The 010 trigger only decremented products.stock_quantity. product_sizes rows
-- carry their own stock_quantity (and the checkout UI sells by size), so size
-- stock never decreased â€” making size-level inventory stale. This redefines the
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


-- ========== MIGRATION 015_discount_newsletter_analytics.sql ==========
-- ============================================================================
-- C9: Make discount usage enforcement actually work
-- increment_discount_usage was SECURITY INVOKER and never granted EXECUTE to
-- authenticated, so the app's RPC call ran as the customer against a table RLS
-- forbids customers from updating -> it silently updated 0 rows and
-- usage_limit was never enforced. Now security definer + atomic conditional
-- increment, returning whether the code still had room.
-- ============================================================================
drop function if exists public.increment_discount_usage(text);
create or replace function public.increment_discount_usage(code_text text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  update public.discount_codes
  set used_count = used_count + 1
  where code = code_text
    and is_active = true
    and (usage_limit is null or used_count < usage_limit);
  return found;
end;
$$;

grant execute on function public.increment_discount_usage(text) to authenticated;

-- Drop unused helper (no application code calls it anymore)
drop function if exists public.check_stock(uuid, integer);

-- ============================================================================
-- C6: Seed bank details into store_settings
-- The live store_settings table is empty, so the checkout page has been
-- rendering fallback constants. These upserts make the checkout bank copy
-- genuinely server-driven.
-- ============================================================================
insert into public.store_settings (key, value) values
  ('bank_name',          'Meezan Bank'),
  ('account_title',      'Misk Lume (Pvt) Ltd'),
  ('account_number',     '0123-0101-2345678-01'),
  ('iban',               'PK90MEZN0001230101234567801')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============================================================================
-- Monitoring / analytics
-- Lightweight self-hosted event log (page views + product/order events).
-- ============================================================================
create table if not exists public.analytics_events (
  id uuid default uuid_generate_v4() primary key,
  event_type text not null,
  page text,
  referrer text,
  user_agent text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.analytics_events is 'Anonymous analytics events collected by the app beacon';

alter table public.analytics_events enable row level security;

create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at);
create index if not exists idx_analytics_events_type on public.analytics_events(event_type);

create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

create policy "Admins can view analytics events"
  on public.analytics_events for select
  using (public.is_admin());

create policy "Admins can delete analytics events"
  on public.analytics_events for delete
  using (public.is_admin());


