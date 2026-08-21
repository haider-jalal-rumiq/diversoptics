begin;

create or replace function public.save_product_attribute_values(
  p_product_id bigint,
  p_values jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not private.has_staff_role(array['owner', 'editor']) then
    raise exception 'catalog editor role required' using errcode = '42501';
  end if;

  if jsonb_typeof(p_values) <> 'array' then
    raise exception 'attribute values must be a JSON array' using errcode = '22023';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'product not found' using errcode = 'P0002';
  end if;

  delete from public.product_attribute_values
  where product_id = p_product_id and variant_id is null;

  insert into public.product_attribute_values (
    product_id,
    attribute_definition_id,
    value_text,
    value_number,
    value_boolean,
    value_json
  )
  select
    p_product_id,
    input.attribute_definition_id,
    input.value_text,
    input.value_number,
    input.value_boolean,
    input.value_json
  from jsonb_to_recordset(p_values) as input(
    attribute_definition_id bigint,
    value_text text,
    value_number numeric,
    value_boolean boolean,
    value_json jsonb
  );
end;
$$;

revoke all on function public.save_product_attribute_values(bigint, jsonb) from public, anon;
grant execute on function public.save_product_attribute_values(bigint, jsonb) to authenticated, service_role;

create or replace function private.validate_product_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if new.published_at is null then
      new.published_at := now();
    end if;

    if not exists (
      select 1
      from public.categories
      where id = new.category_id
        and status = 'published'
        and archived_at is null
    ) then
      raise exception 'A product cannot publish until its category is published.';
    end if;

    if new.brand_id is not null and not exists (
      select 1
      from public.brands
      where id = new.brand_id
        and status = 'published'
        and archived_at is null
    ) then
      raise exception 'A product cannot publish until its brand is published.';
    end if;

    if not exists (
      select 1
      from public.product_media
      where product_id = new.id
        and variant_id is null
        and is_primary
        and archived_at is null
        and rights_status = 'approved'
        and public_path is not null
    ) then
      raise exception 'A product cannot publish without approved primary public media.';
    end if;

    if exists (
      select 1
      from public.attribute_definitions definitions
      where definitions.category_id = new.category_id
        and definitions.is_required
        and definitions.archived_at is null
        and not exists (
          select 1
          from public.product_attribute_values values
          where values.product_id = new.id
            and values.variant_id is null
            and values.attribute_definition_id = definitions.id
        )
    ) then
      raise exception 'A product cannot publish until all required attributes are complete.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.validate_product_publication() from public, anon;
grant execute on function private.validate_product_publication() to authenticated, service_role;

commit;
