begin;

-- Auth identities are not staff accounts until an owner explicitly activates
-- their matching profile. This keeps the CMS invite-only even if hosted Auth
-- sign-up is accidentally enabled outside the application.
alter table public.profiles alter column status set default 'disabled';

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
    'disabled'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.handle_new_user() to service_role, supabase_auth_admin;

commit;
