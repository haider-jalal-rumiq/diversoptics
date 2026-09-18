-- Data operation: create + publish the `watches` category and its brand rows.
--
-- Run this in the Supabase SQL editor against project eevpaueawctcutxultpi
-- BEFORE running the watches catalog importer. The importer throws if the
-- category or brand row is missing or not published.
--
-- This is a data operation, NOT a migration -- categories and brands are rows,
-- and the cufflinks category (id 15) was created the same way. Do not move this
-- file into supabase/migrations/: a phantom remote migration entry for the
-- cufflinks category already caused drift once (see docs/21-...md).
--
-- Safe to re-run: every statement is idempotent on the unique `slug`.
-- It never archives or deletes anything.

begin;

-- 1. Category -------------------------------------------------------------
-- Top-level (parent_id null), matching the /watches nav href.
insert into public.categories (parent_id, name, slug, eyebrow, description, status, sort_order, featured, published_at)
values (
  null,
  'Watches',
  'watches',
  'Timepieces',
  'Everyday and statement timepieces from Casio, Michael Kors, Armani and Seiko.',
  'published',
  40,
  false,
  now()
)
on conflict (slug) do update
set status       = 'published',
    published_at = coalesce(categories.published_at, now()),
    archived_at  = null,
    updated_at   = now();

-- 2. Brands ---------------------------------------------------------------
-- Slugs are chosen to match apps/web/src/lib/config/catalog-navigation.ts:167,
-- so the existing /watches?brand=<slug> nav links resolve to real rows.
insert into public.brands (name, slug, description, status, sort_order, featured, published_at)
values
  ('Casio',         'casio',         'Japanese quartz watches built for everyday reliability.',      'published', 10, false, now()),
  ('Casio Edifice', 'casio-edifice', 'Casio''s metal chronograph line with motorsport styling.',     'published', 20, false, now()),
  ('G-Shock',       'g-shock',       'Shock-resistant Casio watches built to take a beating.',       'published', 30, false, now()),
  ('Michael Kors',  'michael-kors',  'Fashion watches in gold, rose gold and crystal-set finishes.', 'published', 40, false, now()),
  ('Armani',        'armani',        'Emporio Armani and Armani Exchange timepieces.',               'published', 50, false, now()),
  ('Seiko',         'seiko',         'Japanese automatic and chronograph watches.',                  'published', 60, false, now())
on conflict (slug) do update
set status       = 'published',
    published_at = coalesce(brands.published_at, now()),
    archived_at  = null,
    updated_at   = now();

commit;

-- 3. Verify ---------------------------------------------------------------
-- Expect 1 category row and 6 brand rows, all status = 'published'.
select 'category' as kind, id, name, slug, status, published_at
from public.categories
where slug = 'watches'
union all
select 'brand', id, name, slug, status, published_at
from public.brands
where slug in ('casio', 'casio-edifice', 'g-shock', 'michael-kors', 'armani', 'seiko')
order by kind, slug;
