-- Chat database for the site. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Visitors (role "anon") can read messages and add normal messages.
-- They cannot use the owner's alias, cannot mark a message as owner's, and cannot edit or delete anything.

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  alias      text    not null check (char_length(alias) between 1 and 24),
  body       text    not null check (char_length(body)  between 1 and 500),
  is_owner   boolean not null default false
);

alter table public.messages enable row level security;

-- lower case, no accents, only letters and digits ("Ébiya  Aidu!" -> "ebiyaaidu")
create or replace function public.alias_key(a text) returns text
language sql immutable as $$
  select regexp_replace(
    lower(translate(a, 'áàäâéèëêíìïîóòöôúùüûñç', 'aaaaeeeeiiiioooouuuunc')),
    '[^a-z0-9]', '', 'g')
$$;

drop policy if exists "anyone can read" on public.messages;
create policy "anyone can read" on public.messages
  for select to anon using (true);

drop policy if exists "anyone can write normal messages" on public.messages;
create policy "anyone can write normal messages" on public.messages
  for insert to anon
  with check (is_owner = false and public.alias_key(alias) not like '%ebiyaaidu%');

grant select, insert on public.messages to anon;

-- Flood protection: at most 15 new messages per minute in total
create or replace function public.limit_rate() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.messages where created_at > now() - interval '1 minute') >= 15 then
    raise exception 'rate_limited';
  end if;
  return new;
end $$;

drop trigger if exists messages_rate on public.messages;
create trigger messages_rate before insert on public.messages
  for each row execute function public.limit_rate();

-- To answer as the owner: Table Editor > messages > Insert row,
-- alias = Ebiya Aidu, is_owner = true. To delete a message: delete its row there.
