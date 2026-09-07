-- Adds the top-level Cufflinks category the Montblanc cufflinks import publishes
-- into. The storefront resolves categories through the `[...category]` catch-all
-- route, so publishing this row is all a new listing page needs.
insert into public.categories (name, slug, eyebrow, description, status, sort_order, featured, published_at)
values (
  'Cufflinks',
  'cufflinks',
  'Montblanc',
  'Montblanc cufflinks selected for gifting, formal wear and everyday polish.',
  'published',
  40,
  false,
  now()
)
on conflict (slug) do update
set
  name = excluded.name,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  status = excluded.status,
  archived_at = null,
  published_at = coalesce(public.categories.published_at, excluded.published_at);
