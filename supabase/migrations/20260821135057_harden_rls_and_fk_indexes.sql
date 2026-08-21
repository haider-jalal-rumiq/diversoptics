begin;

-- This platform helper is an internal event-trigger function, not an application RPC.
-- Hosted Supabase projects provision it, but the local CLI stack does not, so the
-- revoke is guarded to keep this migration runnable in both environments.
do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and p.pronargs = 0
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;

-- Composite foreign keys need indexes with both columns in constraint order.
create index product_media_variant_product_idx
  on public.product_media (variant_id, product_id)
  where variant_id is not null;
create index product_attribute_values_variant_product_idx
  on public.product_attribute_values (variant_id, product_id)
  where variant_id is not null;

commit;
