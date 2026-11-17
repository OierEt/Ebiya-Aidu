-- Update 2: raw (uncapped) speed, and totals computed from the shots table. Run once in Supabase after shots-setup.sql.
alter table public.shots add column if not exists speed_raw real;

drop function if exists public.record_shot(boolean,int,real,real,real,real,real,real,real,int,int,int,boolean);

create or replace function public.record_shot(
  p_made boolean, p_points int, p_dist real, p_release_x real, p_release_y real,
  p_hoop_dx real, p_hoop_dy real, p_angle real, p_speed real, p_speed_raw real, p_flight_ms int,
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
     or p_angle not between -180 and 180 or p_speed not between 0 and 3000 or p_speed_raw not between 0 and 100000
     or p_flight_ms not between 0 and 20000 or p_vw not between 200 and 10000 or p_vh not between 200 and 10000
  then
    raise exception 'invalid shot';
  end if;
  insert into public.shots (made, points, dist, release_x, release_y, hoop_dx, hoop_dy, angle, speed, speed_raw, flight_ms, vw, vh, touch)
  values (p_made, p_points, p_dist, p_release_x, p_release_y, p_hoop_dx, p_hoop_dy, p_angle, p_speed, p_speed_raw, p_flight_ms, p_vw, p_vh, p_touch);
end;
$$;

revoke all on function public.record_shot(boolean,int,real,real,real,real,real,real,real,real,int,int,int,boolean) from public;
grant execute on function public.record_shot(boolean,int,real,real,real,real,real,real,real,real,int,int,int,boolean) to anon, authenticated;

create or replace function public.shot_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'shots',  count(*),
    'twos',   count(*) filter (where points = 2),
    'threes', count(*) filter (where points = 3),
    'misses', count(*) filter (where points = 0))
  from public.shots;
$$;

revoke all on function public.shot_stats() from public;
grant execute on function public.shot_stats() to anon, authenticated;

-- Optional, to start the statistics from zero (deletes every recorded throw, for example the tests):
-- truncate table public.shots restart identity;
