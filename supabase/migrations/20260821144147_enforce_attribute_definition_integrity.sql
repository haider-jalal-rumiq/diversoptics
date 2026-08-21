begin;

create or replace function private.validate_product_attribute_value()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  product_category_id bigint;
  definition public.attribute_definitions%rowtype;
begin
  select category_id into product_category_id
  from public.products
  where id = new.product_id;

  select * into definition
  from public.attribute_definitions
  where id = new.attribute_definition_id
    and archived_at is null;

  if definition.id is null then
    raise exception 'The attribute definition is unavailable.';
  end if;

  if product_category_id is distinct from definition.category_id then
    raise exception 'The attribute definition must belong to the product category.';
  end if;

  if definition.value_type = 'text' and (
    new.value_text is null or length(btrim(new.value_text)) = 0
  ) then
    raise exception 'A text attribute requires non-blank text.';
  elsif definition.value_type = 'number' and new.value_number is null then
    raise exception 'A number attribute requires a numeric value.';
  elsif definition.value_type = 'boolean' and new.value_boolean is null then
    raise exception 'A boolean attribute requires a boolean value.';
  elsif definition.value_type = 'option' and (
    new.value_text is null or not (definition.options ? new.value_text)
  ) then
    raise exception 'The selected attribute option is invalid.';
  elsif definition.value_type = 'multi_option' and (
    new.value_json is null
    or jsonb_typeof(new.value_json) <> 'array'
    or jsonb_array_length(new.value_json) = 0
    or exists (
      select 1
      from jsonb_array_elements(new.value_json) as selected(value)
      where jsonb_typeof(selected.value) <> 'string'
    )
    or exists (
      select 1
      from jsonb_array_elements_text(new.value_json) as selected(value)
      where not (definition.options ? selected.value)
    )
  ) then
    raise exception 'One or more selected attribute options are invalid.';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_product_attribute_value() from public, anon;
grant execute on function private.validate_product_attribute_value() to authenticated, service_role;

create or replace function private.validate_required_attribute_definition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_required and new.archived_at is null and exists (
    select 1
    from public.products products
    where products.category_id = new.category_id
      and products.status = 'published'
      and products.archived_at is null
      and not exists (
        select 1
        from public.product_attribute_values values
        where values.product_id = products.id
          and values.variant_id is null
          and values.attribute_definition_id = new.id
      )
  ) then
    raise exception 'Unpublish affected products before introducing an incomplete required attribute.';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_required_attribute_definition() from public, anon;
grant execute on function private.validate_required_attribute_definition() to authenticated, service_role;

create trigger attribute_definitions_validate_required_coverage
  before insert or update of category_id, is_required, archived_at
  on public.attribute_definitions
  for each row execute function private.validate_required_attribute_definition();

commit;
