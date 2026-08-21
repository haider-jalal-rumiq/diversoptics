begin;

-- docs/04 requires a minimal first-party inquiry event to be written immediately
-- before the WhatsApp redirect. Anonymous visitors must never hold direct insert
-- rights on inquiry_events, so recording goes through this definer function.
--
-- Two privacy properties are enforced here rather than trusted to callers:
--   1. The stored payload is rebuilt from an explicit key allowlist, so free-text
--      conversation, prescription details or contact data cannot be persisted
--      through this path even if a caller sends them.
--   2. Session and idempotency tokens are hashed by the application and only ever
--      arrive as hex digests, so no reversible visitor identifier is stored. The
--      digest format is verified so a raw token cannot be passed by mistake.
create or replace function public.record_inquiry_event(
  p_event_type text,
  p_idempotency_key_hash text,
  p_catalog_snapshot jsonb,
  p_campaign jsonb default '{}'::jsonb,
  p_entry_path text default null,
  p_anonymous_session_hash text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_snapshot_keys constant text[] := array[
    'slug', 'sku', 'variant_sku', 'brand', 'name', 'price_mode', 'availability'
  ];
  c_campaign_keys constant text[] := array[
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'
  ];
  v_existing text;
  v_item jsonb;
  v_clean_item jsonb;
  v_snapshot jsonb := '[]'::jsonb;
  v_campaign jsonb := '{}'::jsonb;
  v_entry_path text;
  v_key text;
  v_value text;
  v_public_id text;
begin
  if p_event_type is null
    or p_event_type not in ('single_product', 'shortlist') then
    raise exception 'unsupported inquiry event type' using errcode = '22023';
  end if;

  if p_idempotency_key_hash is null
    or p_idempotency_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'idempotency key hash must be a sha-256 hex digest'
      using errcode = '22023';
  end if;

  if p_anonymous_session_hash is not null
    and p_anonymous_session_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'anonymous session hash must be a sha-256 hex digest'
      using errcode = '22023';
  end if;

  -- A retried or double-tapped click must reuse the first reference rather than
  -- creating a second event, so the caller can show a stable inquiry id.
  select public_id into v_existing
  from public.inquiry_events
  where idempotency_key_hash = p_idempotency_key_hash;

  if v_existing is not null then
    return v_existing;
  end if;

  if p_catalog_snapshot is null
    or jsonb_typeof(p_catalog_snapshot) <> 'array' then
    raise exception 'catalog snapshot must be a json array' using errcode = '22023';
  end if;

  if jsonb_array_length(p_catalog_snapshot) = 0
    or jsonb_array_length(p_catalog_snapshot) > 12 then
    raise exception 'catalog snapshot must hold between 1 and 12 items'
      using errcode = '22023';
  end if;

  if p_event_type = 'single_product'
    and jsonb_array_length(p_catalog_snapshot) <> 1 then
    raise exception 'a single product inquiry records exactly one item'
      using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_catalog_snapshot)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'catalog snapshot items must be json objects'
        using errcode = '22023';
    end if;

    v_clean_item := '{}'::jsonb;

    foreach v_key in array c_snapshot_keys
    loop
      if v_item ? v_key and jsonb_typeof(v_item -> v_key) = 'string' then
        v_value := left(btrim(v_item ->> v_key), 200);

        if v_value <> '' then
          v_clean_item := v_clean_item || jsonb_build_object(v_key, v_value);
        end if;
      end if;
    end loop;

    if not (v_clean_item ? 'slug') then
      raise exception 'each catalog snapshot item needs a product slug'
        using errcode = '22023';
    end if;

    v_snapshot := v_snapshot || jsonb_build_array(v_clean_item);
  end loop;

  if p_campaign is not null and jsonb_typeof(p_campaign) = 'object' then
    foreach v_key in array c_campaign_keys
    loop
      if p_campaign ? v_key and jsonb_typeof(p_campaign -> v_key) = 'string' then
        v_value := left(btrim(p_campaign ->> v_key), 120);

        if v_value <> '' then
          v_campaign := v_campaign || jsonb_build_object(v_key, v_value);
        end if;
      end if;
    end loop;
  end if;

  -- Only the path is retained. A query string can carry arbitrary visitor text,
  -- so it is discarded before the value is considered for storage.
  if p_entry_path is not null then
    v_entry_path := left(split_part(split_part(p_entry_path, '?', 1), '#', 1), 300);

    if v_entry_path !~ '^/[A-Za-z0-9/_.-]*$' then
      v_entry_path := null;
    end if;
  end if;

  for i in 1..5 loop
    v_public_id := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));

    begin
      insert into public.inquiry_events (
        public_id,
        idempotency_key_hash,
        anonymous_session_hash,
        event_type,
        catalog_snapshot,
        campaign,
        entry_path
      )
      values (
        v_public_id,
        p_idempotency_key_hash,
        p_anonymous_session_hash,
        p_event_type,
        v_snapshot,
        v_campaign,
        v_entry_path
      );

      return v_public_id;
    exception
      when unique_violation then
        -- Either a concurrent click already claimed this idempotency hash, in
        -- which case its reference wins, or the generated public id collided and
        -- the next iteration draws a new one.
        select public_id into v_existing
        from public.inquiry_events
        where idempotency_key_hash = p_idempotency_key_hash;

        if v_existing is not null then
          return v_existing;
        end if;
    end;
  end loop;

  raise exception 'could not allocate an inquiry reference' using errcode = '40001';
end;
$$;

revoke all on function public.record_inquiry_event(
  text, text, jsonb, jsonb, text, text
) from public;
grant execute on function public.record_inquiry_event(
  text, text, jsonb, jsonb, text, text
) to anon, authenticated, service_role;

commit;
