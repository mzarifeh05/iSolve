-- Private storage: a draft trainer photo must not become public just because its
-- storage path is known. The browser requests expiring signed URLs after RLS checks.
begin;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-photos', 'trainer-photos', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy club_published_photo_read on storage.objects for select to anon, authenticated
using (bucket_id = 'trainer-photos' and exists (
  select 1 from public.trainers where published and photo_path = name
));
create policy club_admin_photo_read on storage.objects for select to authenticated
using (bucket_id = 'trainer-photos' and (select public.is_admin()));
create policy club_admin_photo_upload on storage.objects for insert to authenticated
with check (bucket_id = 'trainer-photos' and (select public.is_admin())
  and name ~ '^trainers/[a-f0-9-]+\.(jpg|png|webp)$');
create policy club_admin_photo_update on storage.objects for update to authenticated
using (bucket_id = 'trainer-photos' and (select public.is_admin()))
with check (bucket_id = 'trainer-photos' and (select public.is_admin())
  and name ~ '^trainers/[a-f0-9-]+\.(jpg|png|webp)$');
create policy club_admin_photo_delete on storage.objects for delete to authenticated
using (bucket_id = 'trainer-photos' and (select public.is_admin()));
commit;
