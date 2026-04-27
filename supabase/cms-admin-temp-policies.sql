-- Deprecated escape hatch for local-only debugging.
-- Do not use this script in any deployable environment.
-- The production-ready path is `supabase/schema.sql`, which now includes
-- authenticated admin policies backed by `public.user_profiles.role = 'admin'`.

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.collections to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.product_dimensions to anon, authenticated;
grant select, insert, update, delete on public.product_images to anon, authenticated;

drop policy if exists "Temporary CMS full access to collections" on public.collections;
create policy "Temporary CMS full access to collections"
on public.collections
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Temporary CMS full access to products" on public.products;
create policy "Temporary CMS full access to products"
on public.products
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Temporary CMS full access to product dimensions" on public.product_dimensions;
create policy "Temporary CMS full access to product dimensions"
on public.product_dimensions
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Temporary CMS full access to product images" on public.product_images;
create policy "Temporary CMS full access to product images"
on public.product_images
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Temporary CMS upload access to product images bucket" on storage.objects;
create policy "Temporary CMS upload access to product images bucket"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
