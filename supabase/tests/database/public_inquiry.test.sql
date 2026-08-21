begin;

create extension if not exists pgtap with schema extensions;
select extensions.plan(20);

-- Surface and privilege shape ------------------------------------------------

select extensions.has_function(
  'public',
  'record_inquiry_event',
  array['text', 'text', 'jsonb', 'jsonb', 'text', 'text'],
  'anonymous inquiry recording is exposed as a database function'
);

select extensions.ok(
  has_function_privilege(
    'anon',
    'public.record_inquiry_event(text, text, jsonb, jsonb, text, text)',
    'EXECUTE'
  ),
  'anon may record an inquiry event through the definer function'
);

select extensions.ok(
  not has_table_privilege('anon', 'public.inquiry_events', 'INSERT'),
  'anon never receives direct insert rights on inquiry_events'
);

select extensions.ok(
  not has_table_privilege('anon', 'public.inquiry_events', 'SELECT'),
  'anon cannot read recorded inquiry events'
);

select extensions.ok(
  has_table_privilege('anon', 'public.site_settings', 'SELECT'),
  'anon receives an explicit public settings read grant'
);

-- Anonymous callers ----------------------------------------------------------

set local role anon;
set local request.jwt.claim.sub = '';

select extensions.results_eq(
  $$ select count(*)::bigint from public.site_settings $$,
  array[1::bigint],
  'anon reads the singleton public settings row'
);

select extensions.matches(
  public.record_inquiry_event(
    'single_product',
    repeat('a', 64),
    '[{"slug": "demo-frame-01", "sku": "DEMO-EYE-001"}]'::jsonb
  ),
  '^[A-Z0-9]{8,16}$',
  'a single product inquiry returns a usable public reference'
);

select extensions.is(
  public.record_inquiry_event(
    'single_product',
    repeat('a', 64),
    '[{"slug": "demo-frame-01", "sku": "DEMO-EYE-001"}]'::jsonb
  ),
  public.record_inquiry_event(
    'single_product',
    repeat('a', 64),
    '[{"slug": "demo-frame-01", "sku": "DEMO-EYE-001"}]'::jsonb
  ),
  'replaying the same click reuses the first inquiry reference'
);

select extensions.lives_ok(
  $$
    select public.record_inquiry_event(
      'single_product',
      repeat('b', 64),
      '[{
        "slug": "demo-watch-01",
        "sku": "DEMO-WAT-001",
        "note": "my prescription is -2.50 and my number is 03001234567"
      }]'::jsonb,
      '{"utm_source": "instagram", "secret": "drop me"}'::jsonb,
      '/products/demo-watch-01?note=sensitive+free+text'
    )
  $$,
  'an inquiry carrying unexpected keys is still accepted'
);

select extensions.lives_ok(
  $$
    select public.record_inquiry_event(
      'shortlist',
      repeat('c', 64),
      '[{"slug": "demo-frame-01"}, {"slug": "demo-pen-01"}]'::jsonb
    )
  $$,
  'a shortlist inquiry records every selected product'
);

select extensions.throws_ok(
  $$ select public.record_inquiry_event('single_product', 'not-a-digest', '[{"slug": "x"}]'::jsonb) $$,
  '22023',
  null::text,
  'a raw idempotency token is rejected instead of being stored'
);

select extensions.throws_ok(
  $$ select public.record_inquiry_event('newsletter', repeat('d', 64), '[{"slug": "x"}]'::jsonb) $$,
  '22023',
  null::text,
  'an unsupported inquiry event type is rejected'
);

select extensions.throws_ok(
  $$
    select public.record_inquiry_event(
      'single_product',
      repeat('e', 64),
      '[{"slug": "a"}, {"slug": "b"}]'::jsonb
    )
  $$,
  '22023',
  null::text,
  'a single product inquiry cannot carry two products'
);

select extensions.throws_ok(
  $$
    select public.record_inquiry_event(
      'shortlist',
      repeat('f', 64),
      (select jsonb_agg(jsonb_build_object('slug', 'p' || generation)) from generate_series(1, 13) as generation)
    )
  $$,
  '22023',
  null::text,
  'an oversized shortlist inquiry is rejected'
);

select extensions.throws_ok(
  $$ select public.record_inquiry_event('shortlist', repeat('0', 64), '[{"sku": "no-slug"}]'::jsonb) $$,
  '22023',
  null::text,
  'a snapshot item without a product slug is rejected'
);

-- Stored payload -------------------------------------------------------------

reset role;

select extensions.results_eq(
  $$ select count(*)::bigint from public.inquiry_events where idempotency_key_hash = repeat('a', 64) $$,
  array[1::bigint],
  'a replayed click never creates a second stored event'
);

select extensions.results_eq(
  $$
    select (catalog_snapshot -> 0) ? 'note'
    from public.inquiry_events
    where idempotency_key_hash = repeat('b', 64)
  $$,
  array[false],
  'snapshot rebuilding drops keys outside the allowlist'
);

select extensions.results_eq(
  $$
    select catalog_snapshot -> 0 ->> 'sku'
    from public.inquiry_events
    where idempotency_key_hash = repeat('b', 64)
  $$,
  array['DEMO-WAT-001'::text],
  'snapshot rebuilding keeps the allowlisted product identifiers'
);

select extensions.results_eq(
  $$
    select campaign ? 'secret'
    from public.inquiry_events
    where idempotency_key_hash = repeat('b', 64)
  $$,
  array[false],
  'campaign rebuilding drops keys outside the UTM allowlist'
);

select extensions.results_eq(
  $$
    select entry_path
    from public.inquiry_events
    where idempotency_key_hash = repeat('b', 64)
  $$,
  array['/products/demo-watch-01'::text],
  'the entry path is stored without its query string'
);

select * from extensions.finish();
rollback;
