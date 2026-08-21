-- Removes the preview catalog seed. See README.md in this directory.
--
-- Run this before real inventory is entered, so a fictional product can never
-- sit alongside a real one. It is written to be safe to run twice.
--
-- Storage objects are NOT removed: the uploaded originals and derivatives live
-- under each product's id prefix in the catalog-source and catalog-public
-- buckets, and must be deleted from the dashboard or replaced through the CMS.

begin;

-- Child rows first; the schema has no cascade on these relationships.
delete from public.product_attribute_values
where product_id in (select id from public.products where sku like 'DX-%');

delete from public.product_media
where product_id in (select id from public.products where sku like 'DX-%');

delete from public.product_variants
where product_id in (select id from public.products where sku like 'DX-%');

delete from public.collection_products
where product_id in (select id from public.products where sku like 'DX-%')
   or collection_id in (select id from public.collections where slug like 'dx-%');

delete from public.products where sku like 'DX-%';

delete from public.collections where slug like 'dx-%';

delete from public.pages where slug like 'dx-%';

delete from public.brands where slug like 'dx-%';

-- Attribute definitions belong to the categories below, so they go first.
delete from public.attribute_definitions
where category_id in (
  select id from public.categories
  where slug in (
    'eyewear', 'optical-frames', 'sunglasses', 'lenses',
    'watches', 'writing-instruments'
  )
);

-- Children before parents, or the self-referencing foreign key blocks the delete.
delete from public.categories
where slug in ('optical-frames', 'sunglasses', 'lenses');

delete from public.categories
where slug in ('eyewear', 'watches', 'writing-instruments');

-- The public email was a real business fact and is deliberately left in place.

commit;

-- Expect every count to be zero.
select
  (select count(*) from public.products where sku like 'DX-%') as products,
  (select count(*) from public.brands where slug like 'dx-%') as brands,
  (select count(*) from public.collections where slug like 'dx-%') as collections,
  (select count(*) from public.pages where slug like 'dx-%') as pages,
  (select count(*) from public.categories) as categories_remaining,
  (select count(*) from public.product_media) as media_remaining;
