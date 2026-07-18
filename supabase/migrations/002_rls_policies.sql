-- ============================================================================
-- Misk Lume E-Commerce Platform — Row Level Security Policies
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
alter table public.settings            enable row level security;
alter table public.activity_log        enable row level security;

-- ============================================================================
-- PROFILES
-- Anyone can read public profile data.  Users can update their own.
-- Only admins can insert/update roles.
-- ============================================================================
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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

create policy "Authenticated users can create orders"
  on public.orders for insert
  with check (auth.role() = 'authenticated');

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

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check (auth.role() = 'authenticated');

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
-- SETTINGS
-- Public read; admin write.
-- ============================================================================
create policy "Settings are publicly readable"
  on public.settings for select
  using (true);

create policy "Admins can manage settings"
  on public.settings for insert
  with check (public.is_admin());

create policy "Admins can update settings"
  on public.settings for update
  using (public.is_admin());

create policy "Admins can delete settings"
  on public.settings for delete
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
