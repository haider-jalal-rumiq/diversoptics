begin;

-- The public catalog renders the confirmed WhatsApp number, address and opening
-- hours, and AGENTS.md forbids hard-coding any of them into components. Phase 02
-- left this singleton readable by staff only, so anonymous visitors could not
-- resolve the destination number. Every column here is a public business fact,
-- so the row is exposed in full rather than through a narrower view.
create policy site_settings_public_read
  on public.site_settings for select to anon
  using (true);

grant select on public.site_settings to anon;

commit;
