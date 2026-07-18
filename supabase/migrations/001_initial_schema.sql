-- ============================================================================
-- Misk Lume E-Commerce Platform — Initial Schema
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
-- SETTINGS
-- Simple key-value store for application configuration.
-- ============================================================================
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.settings is 'Application-level key-value configuration store';

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
