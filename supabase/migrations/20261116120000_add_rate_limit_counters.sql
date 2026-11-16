begin;

-- Fixed-window counters for the public inquiry route, sign-in and staff upload
-- endpoints. Serverless instances share no memory, so the counters live here where
-- every instance can see them. Nothing reads or writes the table directly: clients
-- get no privileges, and the security-definer function below is the only path in.
create table public.rate_limit_counters (
  bucket text not null
    constraint rate_limit_counters_bucket_length
      check (char_length(bucket) between 1 and 200),
  window_start timestamptz not null,
  hits integer not null default 0
    constraint rate_limit_counters_hits_non_negative check (hits >= 0),
  primary key (bucket, window_start)
);

create index rate_limit_counters_window_start_idx
  on public.rate_limit_counters (window_start);

alter table public.rate_limit_counters enable row level security;

revoke all on public.rate_limit_counters from public, anon, authenticated;

-- Counts one attempt against a bucket and reports whether it is still within the
-- limit. Only the Next.js server calls this, with the service role.
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_hits integer;
begin
  if p_bucket is null or char_length(p_bucket) not between 1 and 200 then
    raise exception 'rate limit bucket must be 1 to 200 characters'
      using errcode = '22023';
  end if;

  if p_limit is null or p_limit not between 1 and 100000 then
    raise exception 'rate limit must be between 1 and 100000'
      using errcode = '22023';
  end if;

  if p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'rate limit window must be between 1 and 86400 seconds'
      using errcode = '22023';
  end if;

  -- Windows align to the epoch, so every instance computes the same boundary and a
  -- burst cannot split across two windows.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limit_counters as counter (bucket, window_start, hits)
  values (p_bucket, v_window_start, 1)
  on conflict (bucket, window_start)
  do update set hits = counter.hits + 1
  returning counter.hits into v_hits;

  -- Old windows serve no purpose, so they are pruned on a small share of calls
  -- instead of by a scheduled job.
  if random() < 0.01 then
    delete from public.rate_limit_counters
    where window_start < now() - interval '2 days';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

commit;
