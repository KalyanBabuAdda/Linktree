-- LinkHub v11.1 public-link access fix
-- Run once in Supabase > SQL Editor. Safe to run more than once.

alter table public.links enable row level security;
alter table public.profile_settings enable row level security;

-- Public visitors need to read the profile and visible links.
drop policy if exists "public read profile" on public.profile_settings;
create policy "public read profile"
on public.profile_settings for select
to anon, authenticated
using (true);

drop policy if exists "public read active links" on public.links;
create policy "public read active links"
on public.links for select
to anon, authenticated
using (active = true);

-- Keep admin access explicit for all links, including hidden ones.
drop policy if exists "admin read all links" on public.links;
create policy "admin read all links"
on public.links for select
to authenticated
using (auth.uid() = 'd0973193-8ff0-480d-baab-e5c84515ef40'::uuid);

-- Public analytics inserts used by the GitHub Pages site.
drop policy if exists "public insert page view" on public.page_views;
create policy "public insert page view"
on public.page_views for insert
to anon, authenticated
with check (true);

drop policy if exists "public insert click" on public.click_events;
create policy "public insert click"
on public.click_events for insert
to anon, authenticated
with check (true);
