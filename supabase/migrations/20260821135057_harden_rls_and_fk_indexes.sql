begin;

-- This platform helper is an internal event-trigger function, not an application RPC.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Composite foreign keys need indexes with both columns in constraint order.
create index product_media_variant_product_idx
  on public.product_media (variant_id, product_id)
  where variant_id is not null;
create index product_attribute_values_variant_product_idx
  on public.product_attribute_values (variant_id, product_id)
  where variant_id is not null;

commit;
