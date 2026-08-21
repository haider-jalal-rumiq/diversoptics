begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(30);

select extensions.has_table('public', 'profiles', 'profiles table exists');
select extensions.has_table('public', 'categories', 'categories table exists');
select extensions.has_table('public', 'brands', 'brands table exists');
select extensions.has_table('public', 'products', 'products table exists');
select extensions.has_table('public', 'product_variants', 'product variants table exists');
select extensions.has_table('public', 'product_media', 'product media table exists');
select extensions.has_table('public', 'attribute_definitions', 'attribute definitions table exists');
select extensions.has_table('public', 'product_attribute_values', 'product attribute values table exists');
select extensions.has_table('public', 'collections', 'collections table exists');
select extensions.has_table('public', 'collection_products', 'collection products table exists');
select extensions.has_table('public', 'pages', 'pages table exists');
select extensions.has_table('public', 'site_settings', 'site settings table exists');
select extensions.has_table('public', 'inquiry_events', 'inquiry events table exists');
select extensions.has_table('public', 'audit_log', 'audit log table exists');
select extensions.has_function(
  'public',
  'set_product_primary_media',
  array['bigint', 'bigint'],
  'primary media changes use an atomic database function'
);
select extensions.has_trigger(
  'public',
  'attribute_definitions',
  'attribute_definitions_validate_required_coverage',
  'required attribute coverage is enforced by a database trigger'
);
select extensions.has_function(
  'public',
  'save_product_attribute_values',
  array['bigint', 'jsonb'],
  'product attributes use an atomic replacement function'
);

select extensions.results_eq(
  $$
    select count(*)::bigint
    from pg_class
    join pg_namespace on pg_namespace.oid = pg_class.relnamespace
    where pg_namespace.nspname = 'public'
      and pg_class.relname in (
        'profiles', 'categories', 'brands', 'products', 'product_variants',
        'product_media', 'attribute_definitions', 'product_attribute_values',
        'collections', 'collection_products', 'pages', 'site_settings',
        'inquiry_events', 'audit_log'
      )
      and pg_class.relrowsecurity
  $$,
  array[14::bigint],
  'RLS is enabled on every exposed application table'
);

select extensions.ok(
  has_table_privilege('anon', 'public.categories', 'SELECT'),
  'anon receives an explicit category read grant'
);
select extensions.ok(
  not has_table_privilege('anon', 'public.categories', 'INSERT'),
  'anon never receives a category write grant'
);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'owner@diverso.test'),
  ('10000000-0000-4000-8000-000000000002', 'editor@diverso.test'),
  ('10000000-0000-4000-8000-000000000003', 'viewer@diverso.test');

select extensions.is(
  (select status from public.profiles where id = '10000000-0000-4000-8000-000000000003'),
  'disabled',
  'new Auth identities remain disabled until owner activation'
);

update public.profiles set role = 'owner', status = 'active'
where id = '10000000-0000-4000-8000-000000000001';
update public.profiles set role = 'editor', status = 'active'
where id = '10000000-0000-4000-8000-000000000002';
update public.profiles set status = 'active'
where id = '10000000-0000-4000-8000-000000000003';

insert into public.categories (name, slug, status)
values
  ('Published category', 'test-published-category', 'published'),
  ('Draft category', 'test-draft-category', 'draft');

insert into public.brands (name, slug, status)
values ('Published brand', 'test-published-brand', 'published');

insert into public.products (
  category_id,
  brand_id,
  name,
  slug,
  model_number,
  sku,
  status
)
values (
  (select id from public.categories where slug = 'test-published-category'),
  (select id from public.brands where slug = 'test-published-brand'),
  'Published product',
  'test-published-product',
  'TEST-PUBLISHED-MODEL',
  'TEST-PUBLISHED-SKU',
  'draft'
);

insert into public.product_media (
  product_id,
  source_path,
  public_path,
  alt_text,
  rights_status,
  mime_type,
  width,
  height,
  byte_size,
  is_primary
)
values (
  (select id from public.products where slug = 'test-published-product'),
  'tests/source.jpg',
  'tests/public.webp',
  'Test product front view',
  'approved',
  'image/webp',
  1200,
  900,
  100000,
  true
);

update public.products
set status = 'published'
where slug = 'test-published-product';

insert into public.products (
  category_id,
  brand_id,
  name,
  slug,
  model_number,
  sku,
  status
)
values (
  (select id from public.categories where slug = 'test-published-category'),
  (select id from public.brands where slug = 'test-published-brand'),
  'Product without media',
  'test-product-without-media',
  'TEST-NO-MEDIA-MODEL',
  'TEST-NO-MEDIA-SKU',
  'draft'
);

create or replace function pg_temp.try_publish_without_media()
returns boolean
language plpgsql
as $$
begin
  update public.products
  set status = 'published'
  where slug = 'test-product-without-media';
  return true;
exception when others then
  return false;
end;
$$;

select extensions.ok(
  not pg_temp.try_publish_without_media(),
  'database publication validation rejects products without approved primary media'
);

select extensions.results_eq(
  $$
    select count(*)::bigint
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'catalog_%'
  $$,
  array[8::bigint],
  'source and public catalog buckets have the complete staff policy set'
);

set local role anon;
set local request.jwt.claim.sub = '';

select extensions.results_eq(
  'select count(*)::bigint from public.categories',
  array[1::bigint],
  'anon sees only published categories'
);
select extensions.results_eq(
  'select count(*)::bigint from public.products',
  array[1::bigint],
  'anon sees only published products'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000003';

select extensions.ok(
  (select private.has_staff_role(array['owner', 'editor', 'viewer'])),
  'viewer is recognized as active staff'
);
select extensions.results_eq(
  'select count(*)::bigint from public.categories',
  array[2::bigint],
  'viewer can read draft and published catalog content'
);

create or replace function pg_temp.try_insert_category(test_slug text)
returns boolean
language plpgsql
as $$
begin
  insert into public.categories (name, slug, status)
  values ('Role test category', test_slug, 'draft');
  return true;
exception when others then
  return false;
end;
$$;

select extensions.ok(
  not pg_temp.try_insert_category('viewer-cannot-insert'),
  'viewer cannot insert catalog content'
);

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000002';
select extensions.ok(
  pg_temp.try_insert_category('editor-can-insert'),
  'editor can insert draft catalog content'
);

create or replace function pg_temp.try_disable_profile(target_id uuid)
returns boolean
language plpgsql
as $$
declare
  changed_rows integer;
begin
  update public.profiles set status = 'disabled' where id = target_id;
  get diagnostics changed_rows = row_count;
  return changed_rows = 1;
exception when others then
  return false;
end;
$$;

set local request.jwt.claim.sub = '10000000-0000-4000-8000-000000000001';
select extensions.ok(
  pg_temp.try_disable_profile('10000000-0000-4000-8000-000000000003'),
  'owner can manage another staff profile'
);

select * from extensions.finish();
rollback;
