begin;

-- Private helpers are callable only where explicitly granted and are never exposed by PostgREST.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role, supabase_auth_admin;

-- Adopt Supabase's 2026 explicit-exposure model now instead of relying on changing defaults.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke execute on functions from public;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'viewer'
    constraint profiles_role_check check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'active'
    constraint profiles_status_check check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.categories (id) on delete restrict,
  name text not null constraint categories_name_not_blank check (length(btrim(name)) > 0),
  slug text not null unique
    constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  eyebrow text,
  description text,
  status text not null default 'draft'
    constraint categories_status_check check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  featured boolean not null default false,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create table public.brands (
  id bigint generated always as identity primary key,
  name text not null constraint brands_name_not_blank check (length(btrim(name)) > 0),
  slug text not null unique
    constraint brands_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  logo_path text,
  status text not null default 'draft'
    constraint brands_status_check check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  featured boolean not null default false,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete restrict,
  brand_id bigint references public.brands (id) on delete restrict,
  name text not null constraint products_name_not_blank check (length(btrim(name)) > 0),
  slug text not null unique
    constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  model_number text not null
    constraint products_model_not_blank check (length(btrim(model_number)) > 0),
  sku text not null unique constraint products_sku_not_blank check (length(btrim(sku)) > 0),
  eyebrow text,
  short_description text,
  description text,
  price_mode text not null default 'on_inquiry'
    constraint products_price_mode_check check (price_mode in ('fixed', 'from', 'on_inquiry', 'hidden')),
  price numeric(12, 2),
  currency text not null default 'PKR'
    constraint products_currency_format check (currency ~ '^[A-Z]{3}$'),
  availability text not null default 'ask'
    constraint products_availability_check check (
      availability in ('in_store', 'available_to_order', 'out_of_stock', 'ask')
    ),
  status text not null default 'draft'
    constraint products_status_check check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(model_number, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(sku, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(short_description, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored,
  constraint products_price_state check (
    (price_mode in ('fixed', 'from') and price is not null and price > 0)
    or (price_mode in ('on_inquiry', 'hidden') and price is null)
  ),
  constraint products_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  name text not null constraint product_variants_name_not_blank check (length(btrim(name)) > 0),
  sku text not null unique constraint product_variants_sku_not_blank check (length(btrim(sku)) > 0),
  price_mode text
    constraint product_variants_price_mode_check check (
      price_mode is null or price_mode in ('fixed', 'from', 'on_inquiry', 'hidden')
    ),
  price numeric(12, 2),
  availability text not null default 'ask'
    constraint product_variants_availability_check check (
      availability in ('in_store', 'available_to_order', 'out_of_stock', 'ask')
    ),
  status text not null default 'draft'
    constraint product_variants_status_check check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_price_state check (
    (price_mode is null and price is null)
    or (price_mode in ('fixed', 'from') and price is not null and price > 0)
    or (price_mode in ('on_inquiry', 'hidden') and price is null)
  ),
  constraint product_variants_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  ),
  unique (id, product_id)
);

create table public.product_media (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  variant_id bigint,
  source_path text not null constraint product_media_source_path_not_blank check (length(btrim(source_path)) > 0),
  public_path text constraint product_media_public_path_not_blank check (
    public_path is null or length(btrim(public_path)) > 0
  ),
  alt_text text not null constraint product_media_alt_text_not_blank check (length(btrim(alt_text)) > 0),
  rights_status text not null default 'pending'
    constraint product_media_rights_status_check check (rights_status in ('pending', 'approved', 'restricted')),
  mime_type text not null
    constraint product_media_mime_type_check check (
      mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')
    ),
  width integer not null constraint product_media_width_positive check (width > 0),
  height integer not null constraint product_media_height_positive check (height > 0),
  byte_size bigint not null constraint product_media_byte_size_positive check (byte_size > 0),
  focal_x numeric(4, 3) not null default 0.5
    constraint product_media_focal_x_range check (focal_x between 0 and 1),
  focal_y numeric(4, 3) not null default 0.5
    constraint product_media_focal_y_range check (focal_y between 0 and 1),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_media_variant_product_fkey
    foreign key (variant_id, product_id)
    references public.product_variants (id, product_id)
    on delete cascade
);

create table public.attribute_definitions (
  id bigint generated always as identity primary key,
  category_id bigint not null references public.categories (id) on delete cascade,
  name text not null constraint attribute_definitions_name_not_blank check (length(btrim(name)) > 0),
  key text not null
    constraint attribute_definitions_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  value_type text not null
    constraint attribute_definitions_value_type_check check (
      value_type in ('text', 'number', 'boolean', 'option', 'multi_option')
    ),
  options jsonb not null default '[]'::jsonb
    constraint attribute_definitions_options_array check (jsonb_typeof(options) = 'array'),
  is_required boolean not null default false,
  is_filterable boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, key)
);

create table public.product_attribute_values (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  variant_id bigint,
  attribute_definition_id bigint not null references public.attribute_definitions (id) on delete cascade,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_attribute_values_single_value check (
    num_nonnulls(value_text, value_number, value_boolean, value_json) = 1
  ),
  constraint product_attribute_values_variant_product_fkey
    foreign key (variant_id, product_id)
    references public.product_variants (id, product_id)
    on delete cascade
);

create table public.collections (
  id bigint generated always as identity primary key,
  name text not null constraint collections_name_not_blank check (length(btrim(name)) > 0),
  slug text not null unique
    constraint collections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  eyebrow text,
  description text,
  status text not null default 'draft'
    constraint collections_status_check check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create table public.collection_products (
  id bigint generated always as identity primary key,
  collection_id bigint not null references public.collections (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, product_id)
);

create table public.pages (
  id bigint generated always as identity primary key,
  kind text not null constraint pages_kind_check check (kind in ('guide', 'policy', 'page')),
  title text not null constraint pages_title_not_blank check (length(btrim(title)) > 0),
  slug text not null unique
    constraint pages_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  body_markdown text not null default '',
  status text not null default 'draft'
    constraint pages_status_check check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_archive_state check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived' and archived_at is null)
  )
);

create table public.site_settings (
  id boolean primary key default true constraint site_settings_singleton check (id),
  location_label text not null default 'F-11 Markaz, Islamabad',
  full_address text,
  whatsapp_number text not null default '+92 333 5777710',
  phone_number text,
  public_email text,
  business_hours jsonb,
  delivery_available boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.inquiry_events (
  id bigint generated always as identity primary key,
  public_id text not null unique
    constraint inquiry_events_public_id_format check (public_id ~ '^[A-Z0-9]{8,16}$'),
  idempotency_key_hash text not null unique,
  anonymous_session_hash text,
  event_type text not null
    constraint inquiry_events_event_type_check check (event_type in ('single_product', 'shortlist')),
  catalog_snapshot jsonb not null default '[]'::jsonb
    constraint inquiry_events_catalog_snapshot_array check (jsonb_typeof(catalog_snapshot) = 'array'),
  campaign jsonb not null default '{}'::jsonb
    constraint inquiry_events_campaign_object check (jsonb_typeof(campaign) = 'object'),
  entry_path text,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null constraint audit_log_action_check check (action in ('INSERT', 'UPDATE', 'DELETE')),
  entity_table text not null,
  entity_id text not null,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Invite-only CMS staff identities and authorization roles.';
comment on table public.product_media is 'Metadata for private source objects and public optimized derivatives; never stores binary media.';
comment on table public.inquiry_events is 'Privacy-minimized WhatsApp intent events; customer notes and conversation text are never stored.';
comment on column public.products.updated_at is 'Optimistic concurrency token for CMS edits.';

-- Foreign keys are not indexed automatically by Postgres.
create index categories_parent_id_idx on public.categories (parent_id);
create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_media_product_id_idx on public.product_media (product_id);
create index product_media_variant_id_idx on public.product_media (variant_id) where variant_id is not null;
create index attribute_definitions_category_id_idx on public.attribute_definitions (category_id);
create index product_attribute_values_product_id_idx on public.product_attribute_values (product_id);
create index product_attribute_values_variant_id_idx on public.product_attribute_values (variant_id) where variant_id is not null;
create index product_attribute_values_definition_id_idx on public.product_attribute_values (attribute_definition_id);
create index collection_products_product_id_idx on public.collection_products (product_id);
create index audit_log_actor_id_idx on public.audit_log (actor_id) where actor_id is not null;

create unique index product_media_product_primary_unique
  on public.product_media (product_id)
  where is_primary and variant_id is null and archived_at is null;
create unique index product_media_variant_primary_unique
  on public.product_media (variant_id)
  where is_primary and variant_id is not null and archived_at is null;
create unique index product_attribute_values_product_unique
  on public.product_attribute_values (product_id, attribute_definition_id)
  where variant_id is null;
create unique index product_attribute_values_variant_unique
  on public.product_attribute_values (variant_id, attribute_definition_id)
  where variant_id is not null;

create index products_search_vector_idx on public.products using gin (search_vector);
create index products_public_category_cursor_idx
  on public.products (category_id, published_at desc, id desc)
  where status = 'published' and archived_at is null;
create index products_public_brand_cursor_idx
  on public.products (brand_id, published_at desc, id desc)
  where status = 'published' and archived_at is null and brand_id is not null;
create index products_featured_cursor_idx
  on public.products (published_at desc, id desc)
  where status = 'published' and archived_at is null and featured;
create index categories_public_sort_idx
  on public.categories (sort_order, id)
  where status = 'published' and archived_at is null;
create index brands_public_sort_idx
  on public.brands (sort_order, id)
  where status = 'published' and archived_at is null;
create index collections_public_cursor_idx
  on public.collections (published_at desc, id desc)
  where status = 'published' and archived_at is null;
create index pages_public_kind_cursor_idx
  on public.pages (kind, published_at desc, id desc)
  where status = 'published' and archived_at is null;

create or replace function private.has_staff_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and status = 'active'
        and role = any (allowed_roles)
    );
$$;

revoke all on function private.has_staff_role(text[]) from public, anon;
grant execute on function private.has_staff_role(text[]) to authenticated, service_role;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon;
grant execute on function private.set_updated_at() to authenticated, service_role;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role, status)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    'viewer',
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.handle_new_user() to service_role, supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

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
  end if;

  return new;
end;
$$;

revoke all on function private.validate_product_publication() from public, anon;
grant execute on function private.validate_product_publication() to authenticated, service_role;

create trigger products_validate_publication
  before insert or update of status, category_id, brand_id, price_mode, price, availability
  on public.products
  for each row execute function private.validate_product_publication();

create or replace function private.set_publication_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.set_publication_timestamp() from public, anon;
grant execute on function private.set_publication_timestamp() to authenticated, service_role;

create trigger categories_set_publication_timestamp
  before insert or update of status on public.categories
  for each row execute function private.set_publication_timestamp();
create trigger brands_set_publication_timestamp
  before insert or update of status on public.brands
  for each row execute function private.set_publication_timestamp();
create trigger collections_set_publication_timestamp
  before insert or update of status on public.collections
  for each row execute function private.set_publication_timestamp();
create trigger pages_set_publication_timestamp
  before insert or update of status on public.pages
  for each row execute function private.set_publication_timestamp();

create or replace function private.validate_product_attribute_value()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  product_category_id bigint;
  definition_category_id bigint;
begin
  select category_id into product_category_id
  from public.products
  where id = new.product_id;

  select category_id into definition_category_id
  from public.attribute_definitions
  where id = new.attribute_definition_id;

  if product_category_id is distinct from definition_category_id then
    raise exception 'The attribute definition must belong to the product category.';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_product_attribute_value() from public, anon;
grant execute on function private.validate_product_attribute_value() to authenticated, service_role;

create trigger product_attribute_values_validate_category
  before insert or update of product_id, attribute_definition_id
  on public.product_attribute_values
  for each row execute function private.validate_product_attribute_value();

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  row_id text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  row_id := coalesce(row_data ->> 'id', 'unknown');

  insert into public.audit_log (actor_id, action, entity_table, entity_id, summary)
  values (
    (select auth.uid()),
    tg_op,
    tg_table_name,
    row_id,
    jsonb_strip_nulls(jsonb_build_object(
      'name', row_data ->> 'name',
      'title', row_data ->> 'title',
      'slug', row_data ->> 'slug',
      'sku', row_data ->> 'sku',
      'status', row_data ->> 'status',
      'updated_at', row_data ->> 'updated_at'
    ))
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.audit_row_change() from public, anon;
grant execute on function private.audit_row_change() to authenticated, service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'categories', 'brands', 'products', 'product_variants',
    'product_media', 'attribute_definitions', 'product_attribute_values',
    'collections', 'collection_products', 'pages', 'site_settings'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name,
      table_name
    );
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I for each row execute function private.audit_row_change()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

insert into public.site_settings (id)
values (true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'catalog-source',
    'catalog-source',
    false,
    15728640,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'catalog-public',
    'catalog-public',
    true,
    4194304,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Every application table in the exposed public schema is protected before grants are added.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiry_events enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_read_self_or_owner
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.has_staff_role(array['owner'])));
create policy profiles_owner_update
  on public.profiles for update to authenticated
  using ((select private.has_staff_role(array['owner'])))
  with check ((select private.has_staff_role(array['owner'])));

create policy categories_public_read
  on public.categories for select to anon
  using (status = 'published' and archived_at is null);
create policy categories_staff_read
  on public.categories for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy categories_editor_insert
  on public.categories for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy categories_editor_update
  on public.categories for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy brands_public_read
  on public.brands for select to anon
  using (status = 'published' and archived_at is null);
create policy brands_staff_read
  on public.brands for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy brands_editor_insert
  on public.brands for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy brands_editor_update
  on public.brands for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy products_public_read
  on public.products for select to anon
  using (status = 'published' and archived_at is null);
create policy products_staff_read
  on public.products for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy products_editor_insert
  on public.products for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy products_editor_update
  on public.products for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy product_variants_public_read
  on public.product_variants for select to anon
  using (
    status = 'published'
    and archived_at is null
    and exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.status = 'published'
        and products.archived_at is null
    )
  );
create policy product_variants_staff_read
  on public.product_variants for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy product_variants_editor_insert
  on public.product_variants for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy product_variants_editor_update
  on public.product_variants for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy product_media_public_read
  on public.product_media for select to anon
  using (
    archived_at is null
    and public_path is not null
    and rights_status = 'approved'
    and exists (
      select 1 from public.products
      where products.id = product_media.product_id
        and products.status = 'published'
        and products.archived_at is null
    )
  );
create policy product_media_staff_read
  on public.product_media for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy product_media_editor_insert
  on public.product_media for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy product_media_editor_update
  on public.product_media for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy attribute_definitions_public_read
  on public.attribute_definitions for select to anon
  using (
    archived_at is null
    and exists (
      select 1 from public.categories
      where categories.id = attribute_definitions.category_id
        and categories.status = 'published'
        and categories.archived_at is null
    )
  );
create policy attribute_definitions_staff_read
  on public.attribute_definitions for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy attribute_definitions_editor_insert
  on public.attribute_definitions for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy attribute_definitions_editor_update
  on public.attribute_definitions for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy product_attribute_values_public_read
  on public.product_attribute_values for select to anon
  using (
    exists (
      select 1 from public.products
      where products.id = product_attribute_values.product_id
        and products.status = 'published'
        and products.archived_at is null
    )
  );
create policy product_attribute_values_staff_read
  on public.product_attribute_values for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy product_attribute_values_editor_insert
  on public.product_attribute_values for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy product_attribute_values_editor_update
  on public.product_attribute_values for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy product_attribute_values_editor_delete
  on public.product_attribute_values for delete to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])));

create policy collections_public_read
  on public.collections for select to anon
  using (status = 'published' and archived_at is null);
create policy collections_staff_read
  on public.collections for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy collections_editor_insert
  on public.collections for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy collections_editor_update
  on public.collections for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy collection_products_public_read
  on public.collection_products for select to anon
  using (
    exists (
      select 1 from public.collections
      where collections.id = collection_products.collection_id
        and collections.status = 'published'
        and collections.archived_at is null
    )
    and exists (
      select 1 from public.products
      where products.id = collection_products.product_id
        and products.status = 'published'
        and products.archived_at is null
    )
  );
create policy collection_products_staff_read
  on public.collection_products for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy collection_products_editor_insert
  on public.collection_products for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy collection_products_editor_update
  on public.collection_products for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy collection_products_editor_delete
  on public.collection_products for delete to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])));

create policy pages_public_read
  on public.pages for select to anon
  using (status = 'published' and archived_at is null);
create policy pages_staff_read
  on public.pages for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy pages_editor_insert
  on public.pages for insert to authenticated
  with check ((select private.has_staff_role(array['owner', 'editor'])));
create policy pages_editor_update
  on public.pages for update to authenticated
  using ((select private.has_staff_role(array['owner', 'editor'])))
  with check ((select private.has_staff_role(array['owner', 'editor'])));

create policy site_settings_staff_read
  on public.site_settings for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy site_settings_owner_update
  on public.site_settings for update to authenticated
  using ((select private.has_staff_role(array['owner'])))
  with check ((select private.has_staff_role(array['owner'])));

create policy inquiry_events_staff_read
  on public.inquiry_events for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));
create policy audit_log_staff_read
  on public.audit_log for select to authenticated
  using ((select private.has_staff_role(array['owner', 'editor', 'viewer'])));

create policy catalog_source_staff_read
  on storage.objects for select to authenticated
  using (
    bucket_id = 'catalog-source'
    and (select private.has_staff_role(array['owner', 'editor', 'viewer']))
  );
create policy catalog_public_staff_read
  on storage.objects for select to authenticated
  using (
    bucket_id = 'catalog-public'
    and (select private.has_staff_role(array['owner', 'editor', 'viewer']))
  );
create policy catalog_source_editor_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'catalog-source'
    and (select private.has_staff_role(array['owner', 'editor']))
  );
create policy catalog_source_editor_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'catalog-source'
    and (select private.has_staff_role(array['owner', 'editor']))
  )
  with check (
    bucket_id = 'catalog-source'
    and (select private.has_staff_role(array['owner', 'editor']))
  );
create policy catalog_source_editor_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'catalog-source'
    and (select private.has_staff_role(array['owner', 'editor']))
  );
create policy catalog_public_editor_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'catalog-public'
    and (select private.has_staff_role(array['owner', 'editor']))
  );
create policy catalog_public_editor_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'catalog-public'
    and (select private.has_staff_role(array['owner', 'editor']))
  )
  with check (
    bucket_id = 'catalog-public'
    and (select private.has_staff_role(array['owner', 'editor']))
  );
create policy catalog_public_editor_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'catalog-public'
    and (select private.has_staff_role(array['owner', 'editor']))
  );

-- Explicit Data API grants are deliberately narrower than RLS policies.
grant select on public.categories, public.brands, public.products,
  public.product_variants, public.product_media, public.attribute_definitions,
  public.product_attribute_values, public.collections, public.collection_products,
  public.pages
to anon;

grant select on public.profiles, public.categories, public.brands, public.products,
  public.product_variants, public.product_media, public.attribute_definitions,
  public.product_attribute_values, public.collections, public.collection_products,
  public.pages, public.site_settings, public.inquiry_events, public.audit_log
to authenticated;

grant insert, update on public.categories, public.brands, public.products,
  public.product_variants, public.product_media, public.attribute_definitions,
  public.product_attribute_values, public.collections, public.collection_products,
  public.pages
to authenticated;
grant delete on public.product_attribute_values, public.collection_products to authenticated;
grant update on public.profiles, public.site_settings to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema private to service_role;

commit;
