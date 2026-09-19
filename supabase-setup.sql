-- SRIRAM LINKHUB — run this once in Supabase > SQL Editor.
-- BEFORE RUNNING: create your admin user in Authentication > Users > Add user.
-- Then replace YOUR_ADMIN_USER_UUID below with that user's UUID.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.profile_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'SRIRAM',
  bio text not null default 'Designer • Creator • Developer',
  tagline text not null default 'Built for a bolder tomorrow.',
  overlay int not null default 55 check (overlay between 20 and 85),
  background_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  url text not null,
  logo text not null default 'website',
  icon text not null default '↗',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id bigint generated always as identity primary key,
  link_id uuid references public.links(id) on delete cascade,
  created_at timestamptz not null default now()
);

insert into public.profile_settings (id) values (1) on conflict (id) do nothing;

-- Replace this UUID before running:
insert into public.admin_users(user_id)
values ('d0973193-8ff0-480d-baab-e5c84515ef40')
on conflict (user_id) do nothing;

alter table public.admin_users enable row level security;
alter table public.profile_settings enable row level security;
alter table public.links enable row level security;
alter table public.page_views enable row level security;
alter table public.click_events enable row level security;

-- Public can read the profile and active links.
drop policy if exists "public read profile" on public.profile_settings;
create policy "public read profile" on public.profile_settings for select to anon, authenticated using (true);

drop policy if exists "public read active links" on public.links;
create policy "public read active links" on public.links for select to anon using (active = true);

drop policy if exists "admin read all links" on public.links;
create policy "admin read all links" on public.links for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Public analytics are insert-only.
drop policy if exists "public insert page view" on public.page_views;
create policy "public insert page view" on public.page_views for insert to anon, authenticated with check (true);

drop policy if exists "public insert click" on public.click_events;
create policy "public insert click" on public.click_events for insert to anon, authenticated with check (true);

-- Only the designated admin can manage content and read analytics.
drop policy if exists "admin update profile" on public.profile_settings;
create policy "admin update profile" on public.profile_settings for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin insert links" on public.links;
create policy "admin insert links" on public.links for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin update links" on public.links;
create policy "admin update links" on public.links for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin delete links" on public.links;
create policy "admin delete links" on public.links for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin read page views" on public.page_views;
create policy "admin read page views" on public.page_views for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin read clicks" on public.click_events;
create policy "admin read clicks" on public.click_events for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Seed links only when the table is empty.
insert into public.links(title,subtitle,url,logo,icon,active,sort_order)
select * from (values
 ('Instagram','Life behind the scenes','https://instagram.com','instagram','◎',true,1),
 ('YouTube','Videos, vlogs & more','https://youtube.com','youtube','▶',true,2),
 ('My Portfolio','Projects, design & code','https://example.com','website','◎',true,3),
 ('Red Dragon Streetwear','Wear the attitude','https://example.com','custom','🐉',true,4),
 ('GitHub','Code, open source','https://github.com','github','●',true,5),
 ('Contact Me','Let''s work together','mailto:you@example.com','email','✉',true,6)
) as seed(title,subtitle,url,logo,icon,active,sort_order)
where not exists (select 1 from public.links);
