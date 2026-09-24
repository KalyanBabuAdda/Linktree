-- LinkHub v11.2: definitive public read fix
-- Run once in Supabase > SQL Editor.

alter table public.links enable row level security;
alter table public.profile_settings enable row level security;

-- RLS decides which rows are visible; GRANT lets the API role issue SELECT at all.
grant usage on schema public to anon, authenticated;
grant select on table public.links to anon, authenticated;
grant select on table public.profile_settings to anon, authenticated;

drop policy if exists "public read active links" on public.links;
create policy "public read active links"
on public.links
for select
to anon
using (active is true);

drop policy if exists "public read profile" on public.profile_settings;
create policy "public read profile"
on public.profile_settings
for select
to anon
using (true);

-- Keep signed-in admin reads available as well.
drop policy if exists "admin read all links" on public.links;
create policy "admin read all links"
on public.links
for select
to authenticated
using (auth.uid() = 'd0973193-8ff0-480d-baab-e5c84515ef40'::uuid);

-- Public analytics inserts.
grant insert on table public.page_views to anon, authenticated;
grant insert on table public.click_events to anon, authenticated;

drop policy if exists "public insert page view" on public.page_views;
create policy "public insert page view"
on public.page_views for insert
to anon
with check (true);

drop policy if exists "public insert click" on public.click_events;
create policy "public insert click"
on public.click_events for insert
to anon
with check (true);
