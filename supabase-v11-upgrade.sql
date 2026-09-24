-- LinkHub v11 upgrade. Run once in Supabase > SQL Editor.
-- Safe to run on the existing project.
alter table public.profile_settings add column if not exists logo_url text;
alter table public.profile_settings add column if not exists theme text not null default 'glass';
alter table public.profile_settings add column if not exists accent text not null default '#ffffff';
alter table public.profile_settings add column if not exists radius int not null default 18;
alter table public.profile_settings drop constraint if exists profile_settings_overlay_check;
update public.profile_settings set overlay=48 where overlay is null;
alter table public.profile_settings add constraint profile_settings_overlay_check check (overlay between 0 and 90);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('linkhub-assets','linkhub-assets',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "public read linkhub assets" on storage.objects;
create policy "public read linkhub assets" on storage.objects for select to public using (bucket_id='linkhub-assets');
drop policy if exists "admin upload linkhub assets" on storage.objects;
create policy "admin upload linkhub assets" on storage.objects for insert to authenticated with check (bucket_id='linkhub-assets' and auth.uid()='d0973193-8ff0-480d-baab-e5c84515ef40'::uuid);
drop policy if exists "admin update linkhub assets" on storage.objects;
create policy "admin update linkhub assets" on storage.objects for update to authenticated using (bucket_id='linkhub-assets' and auth.uid()='d0973193-8ff0-480d-baab-e5c84515ef40'::uuid) with check (bucket_id='linkhub-assets' and auth.uid()='d0973193-8ff0-480d-baab-e5c84515ef40'::uuid);
