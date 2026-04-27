create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  collection text not null,
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD')),
  base_price numeric(10, 2) not null default 200 check (base_price >= 0),
  compare_at_price numeric(10, 2) default 249,
  availability_status text not null default 'in-stock' check (availability_status in ('in-stock', 'low-stock', 'made-to-order', 'sold-out')),
  available_for_sale boolean not null default true,
  availability_label text not null default 'In stock',
  lead_time_label text not null default 'Dispatches in 2 to 4 business days.',
  badge text,
  badge_class_name text,
  material_summary text,
  features text[] not null default '{}'::text[],
  seo_title text,
  seo_description text,
  seo_canonical_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_dimensions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null,
  label text not null,
  width_cm numeric(8, 2) not null check (width_cm > 0),
  height_cm numeric(8, 2) not null check (height_cm > 0),
  unit text not null default 'cm' check (unit in ('cm')),
  amount numeric(10, 2) not null default 200 check (amount >= 0),
  compare_at_amount numeric(10, 2) default 249,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, code)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  role text not null default 'gallery' check (role in ('primary', 'gallery')),
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  payment_provider text not null default 'razorpay' check (payment_provider in ('razorpay')),
  status text not null default 'created' check (status in ('created', 'payment_pending', 'payment_authorized', 'paid', 'failed', 'cancelled', 'fulfilled')),
  payment_status text not null default 'created' check (payment_status in ('created', 'verified', 'failed', 'refunded')),
  currency_code text not null default 'INR' check (currency_code in ('INR', 'USD')),
  subtotal_amount numeric(10, 2) not null default 0,
  shipping_amount numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  delivery_method text not null default 'standard' check (delivery_method in ('standard', 'express')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address jsonb not null,
  notes jsonb not null default '{}'::jsonb,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null,
  product_title text not null,
  selected_dimension_id uuid references public.product_dimensions(id) on delete set null,
  selected_dimension_label text not null,
  selected_frame text not null default 'Unframed',
  quantity integer not null check (quantity > 0),
  unit_amount numeric(10, 2) not null check (unit_amount >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products
  alter column base_price set default 200,
  alter column compare_at_price set default 249;

alter table public.product_dimensions
  alter column amount set default 200,
  alter column compare_at_amount set default 249;

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  generated text;
begin
  loop
    generated := 'BP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    exit when not exists (
      select 1
      from public.orders
      where order_number = generated
    );
  end loop;

  return generated;
end;
$$;

alter table public.orders
  alter column order_number set default public.generate_order_number();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    phone,
    full_name,
    avatar_url
  )
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.user_profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_profiles.user_id = auth.uid()
      and user_profiles.role = 'admin'
  );
$$;

create index if not exists products_sort_order_idx on public.products(sort_order);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists collections_sort_order_idx on public.collections(sort_order);
create index if not exists collections_active_idx on public.collections(is_active);
create index if not exists user_profiles_role_idx on public.user_profiles(role);
create index if not exists product_dimensions_product_id_idx on public.product_dimensions(product_id);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_images_role_idx on public.product_images(role);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

drop trigger if exists set_collections_updated_at on public.collections;
create trigger set_collections_updated_at
before update on public.collections
for each row execute procedure public.set_updated_at();

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists set_product_dimensions_updated_at on public.product_dimensions;
create trigger set_product_dimensions_updated_at
before update on public.product_dimensions
for each row execute procedure public.set_updated_at();

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
before update on public.product_images
for each row execute procedure public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.user_profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_dimensions enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.collections enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.collections to anon, authenticated;
grant select on public.products, public.product_dimensions, public.product_images to anon, authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select, insert, update, delete on public.collections, public.products, public.product_dimensions, public.product_images to authenticated;

drop policy if exists "Public can read active collections" on public.collections;
create policy "Public can read active collections"
on public.collections
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read dimensions for active products" on public.product_dimensions;
create policy "Public can read dimensions for active products"
on public.product_dimensions
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_dimensions.product_id
      and products.is_active = true
  )
);

drop policy if exists "Public can read images for active products" on public.product_images;
create policy "Public can read images for active products"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.is_active = true
  )
);

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own profile" on public.user_profiles;
create policy "Users can create own profile"
on public.user_profiles
for insert
to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage collections" on public.collections;
create policy "Admins can manage collections"
on public.collections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage product dimensions" on public.product_dimensions;
create policy "Admins can manage product dimensions"
on public.product_dimensions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage product images" on public.product_images;
create policy "Admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
  )
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Temporary CMS full access to collections" on public.collections;
drop policy if exists "Temporary CMS full access to products" on public.products;
drop policy if exists "Temporary CMS full access to product dimensions" on public.product_dimensions;
drop policy if exists "Temporary CMS full access to product images" on public.product_images;

drop policy if exists "Public can read product images bucket" on storage.objects;
create policy "Public can read product images bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Temporary CMS upload access to product images bucket" on storage.objects;

drop policy if exists "Admins can upload product images bucket" on storage.objects;
create policy "Admins can upload product images bucket"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

drop policy if exists "Admins can update product images bucket" on storage.objects;
create policy "Admins can update product images bucket"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

drop policy if exists "Admins can delete product images bucket" on storage.objects;
create policy "Admins can delete product images bucket"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
);
