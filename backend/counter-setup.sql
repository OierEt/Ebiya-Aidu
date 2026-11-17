-- Global basket counter for the lauburu game. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Visitors can only READ the totals and call add_basket(); they cannot write to the table directly.

create table if not exists public.counters (
  name  text primary key,
  value bigint not null default 0
);

insert into public.counters (name, value) values ('baskets', 0), ('points', 0)
on conflict (name) do nothing;

alter table public.counters enable row level security;

drop policy if exists "anyone can read counters" on public.counters;
create policy "anyone can read counters" on public.counters for select using (true);
-- no insert/update/delete policy: the table cannot be changed directly from the browser

-- One call = one basket worth 2 or 3 points.
create or replace function public.add_basket(p_points int)
returns table (baskets bigint, points bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points not in (2, 3) then
    raise exception 'invalid points';
  end if;
  update public.counters set value = value + 1 where name = 'baskets';
  update public.counters set value = value + p_points where name = 'points';
  return query
    select (select value from public.counters where name = 'baskets'),
           (select value from public.counters where name = 'points');
end;
$$;

revoke all on function public.add_basket(int) from public;
grant execute on function public.add_basket(int) to anon, authenticated;
