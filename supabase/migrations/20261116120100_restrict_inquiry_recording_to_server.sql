begin;

-- The publishable key ships in every browser bundle. While anon could execute
-- record_inquiry_event, anyone could call it directly through the Data API and skip
-- the inquiry route's rate limit. Recording now happens only from the Next.js server,
-- which connects with the service role.
--
-- Deploy the application code that uses SUPABASE_SECRET_KEY before applying this
-- migration. Until then the anon call would fail and inquiry events would not record,
-- although the WhatsApp redirect still works.
revoke execute on function public.record_inquiry_event(
  text, text, jsonb, jsonb, text, text
) from anon, authenticated;

commit;
