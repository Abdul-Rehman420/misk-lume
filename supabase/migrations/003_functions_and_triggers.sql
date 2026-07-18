-- ============================================================================
-- Misk Lume E-Commerce Platform — Functions & Triggers
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

create trigger set_updated_at_settings
  before update on public.settings
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
-- ============================================================================
create or replace function public.restore_stock_on_cancellation()
returns trigger
language plpgsql
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
