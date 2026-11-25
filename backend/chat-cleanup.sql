-- Optional: delete chat messages automatically after 14 days.
-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- If the first line fails, enable "pg_cron" in Database > Extensions and run only the second part.

create extension if not exists pg_cron with schema pg_catalog;

-- every day at 03:17 UTC: remove every message older than 14 days
select cron.schedule(
  'delete-old-chat-messages',
  '17 3 * * *',
  $$ delete from public.messages where created_at < now() - interval '14 days' $$
);

-- To stop it later:   select cron.unschedule('delete-old-chat-messages');
-- To keep the owner's own messages forever, add:   and is_owner = false   inside the delete.
