-- Anonymous record of every throw, for charts. Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- (Run backend/counter-setup.sql first.) Nothing that identifies a visitor is stored.

create table if not exists public.shots (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  made       boolean  not null,
  points     smallint not null,      -- 0 = missed, 2 or 3
  dist       real     not null,      -- px from release point to the rim
  release_x  real     not null,      -- release position as a fraction of the window width (0-1)
  release_y  real     not null,      -- same, of the window height
  hoop_dx    real     not null,      -- px from release point to the rim, horizontal
  hoop_dy    real     not null,      -- px, vertical (positive = the rim is above)
  angle      real     not null,      -- throw direction in degrees (0 = right, 90 = up)
  speed      real     not null,      -- px/s at release
  flight_ms  integer  not null,
  vw         integer  not null,      -- window size in px
  vh         integer  not null,
  touch      boolean  not null
);

alter table public.shots enable row level security;
drop policy if exists "anyone can read shots" on public.shots;
create policy "anyone can read shots" on public.shots for select using (true);
-- no insert/update/delete policy: rows can only be added through record_shot()

insert into public.counters (name, value) values ('shots', 0) on conflict (name) do nothing;

create or replace function public.record_shot(
  p_made boolean, p_points int, p_dist real, p_release_x real, p_release_y real,
  p_hoop_dx real, p_hoop_dy real, p_angle real, p_speed real, p_flight_ms int,
  p_vw int, p_vh int, p_touch boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_points not in (0, 2, 3) or p_made <> (p_points > 0)
     or p_dist not between 0 and 10000 or p_release_x not between 0 and 1 or p_release_y not between 0 and 1
     or p_hoop_dx not between -10000 and 10000 or p_hoop_dy not between -10000 and 10000
     or p_angle not between -180 and 180 or p_speed not between 0 and 3000
     or p_flight_ms not between 0 and 20000 or p_vw not between 200 and 10000 or p_vh not between 200 and 10000
  then
    raise exception 'invalid shot';
  end if;
  insert into public.shots (made, points, dist, release_x, release_y, hoop_dx, hoop_dy, angle, speed, flight_ms, vw, vh, touch)
  values (p_made, p_points, p_dist, p_release_x, p_release_y, p_hoop_dx, p_hoop_dy, p_angle, p_speed, p_flight_ms, p_vw, p_vh, p_touch);
  update public.counters set value = value + 1 where name = 'shots';
  if p_made then
    update public.counters set value = value + 1 where name = 'baskets';
    update public.counters set value = value + p_points where name = 'points';
  end if;
end;
$$;

revoke all on function public.record_shot(boolean,int,real,real,real,real,real,real,real,int,int,int,boolean) from public;
grant execute on function public.record_shot(boolean,int,real,real,real,real,real,real,real,int,int,int,boolean) to anon, authenticated;
