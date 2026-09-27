-- Data operation: create + publish the `salvatore-ferragamo` brand.
--
-- Run in the Supabase SQL editor against project eevpaueawctcutxultpi BEFORE
-- running the sunglasses importer. Chopard (id 18) and Versace (id 11) already
-- exist and are published; Ferragamo is the only missing brand in this batch.
--
-- Data operation, not a migration -- brands are rows. See the note in
-- 2026-09-18-watches-category-and-brands.sql. Safe to re-run.

begin;

insert into public.brands (name, slug, description, status, sort_order, featured, published_at)
values (
  'Salvatore Ferragamo',
  'salvatore-ferragamo',
  'Italian luxury eyewear with Gancini hardware and sculpted acetate frames.',
  'published',
  24,
  false,
  now()
)
on conflict (slug) do update
set status       = 'published',
    published_at = coalesce(brands.published_at, now()),
    archived_at  = null,
    updated_at   = now();

commit;

-- Verify: expect one published row.
select id, name, slug, status, published_at
from public.brands
where slug = 'salvatore-ferragamo';
