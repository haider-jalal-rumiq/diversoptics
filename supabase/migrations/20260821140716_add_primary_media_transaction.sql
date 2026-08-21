begin;

-- Switching a primary image touches two rows and must be atomic so the unique
-- partial index is never exposed to a client-side race.
create or replace function public.set_product_primary_media(
  p_product_id bigint,
  p_media_id bigint
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

  if not exists (
    select 1
    from public.product_media
    where id = p_media_id
      and product_id = p_product_id
      and variant_id is null
      and archived_at is null
      and rights_status = 'approved'
      and public_path is not null
  ) then
    raise exception 'primary media must be an approved product derivative'
      using errcode = '23514';
  end if;

  update public.product_media
  set is_primary = false
  where product_id = p_product_id
    and variant_id is null
    and is_primary
    and archived_at is null;

  update public.product_media
  set is_primary = true
  where id = p_media_id
    and product_id = p_product_id;
end;
$$;

revoke all on function public.set_product_primary_media(bigint, bigint) from public, anon;
grant execute on function public.set_product_primary_media(bigint, bigint) to authenticated, service_role;

commit;
