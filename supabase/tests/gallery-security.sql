-- Rollback-only test. Run after all migrations as database owner in isolation.
begin;
insert into auth.users(id,email) values
('81000000-0000-4000-8000-000000000001','gallery-admin@example.invalid'),
('81000000-0000-4000-8000-000000000002','gallery-reader@example.invalid');
insert into public.admin_members(user_id) values('81000000-0000-4000-8000-000000000001');
insert into public.gallery_photos(id,slug,content_hash,variants,caption_en,alt_en,category,published)
select ('82000000-0000-4000-8000-00000000000'||n)::uuid,'test-'||n,repeat(letter,64),
 jsonb_build_object('thumbnails',jsonb_build_array(jsonb_build_object('path','gallery/'||repeat(letter,64)||'/test-320.webp','fallback_path','gallery/'||repeat(letter,64)||'/test-320.jpg','width',320,'height',213)),
 'lightbox',jsonb_build_object('path','gallery/'||repeat(letter,64)||'/test-full.webp','fallback_path','gallery/'||repeat(letter,64)||'/test-full.jpg','width',1920,'height',1280)),
 'Gallery security fixture','A test image','training',n=1
from (values(1,'a'),(2,'b')) fixtures(n,letter);
insert into storage.objects(bucket_id,name) values
('gallery-photos','gallery/'||repeat('a',64)||'/test-320.webp'),
('gallery-photos','gallery/'||repeat('b',64)||'/test-320.webp');

set local role anon;
select set_config('request.jwt.claims','{}',true);
do $$ declare modified integer; begin
 if (select count(*) from public.gallery_photos where id in('82000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000002'))<>1 then raise exception 'Anonymous gallery visibility failed';end if;
 if exists(select 1 from storage.objects where bucket_id='gallery-photos' and name='gallery/'||repeat('b',64)||'/test-320.webp') then raise exception 'Draft gallery asset leaked';end if;
 if not exists(select 1 from storage.objects where bucket_id='gallery-photos' and name='gallery/'||repeat('a',64)||'/test-320.webp') then raise exception 'Published asset unavailable';end if;
 begin update public.gallery_photos set published=false;raise exception 'Anonymous edit succeeded';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"81000000-0000-4000-8000-000000000002","role":"authenticated","user_metadata":{"admin":true}}',true);
do $$ declare modified integer;begin
 if public.is_admin() then raise exception 'Metadata granted admin';end if;
 update public.gallery_photos set caption_en='Unauthorized' where id='82000000-0000-4000-8000-000000000001';get diagnostics modified=row_count;
 if modified<>0 then raise exception 'Non-admin edited gallery';end if;
 delete from public.gallery_photos where id='82000000-0000-4000-8000-000000000001';get diagnostics modified=row_count;
 if modified<>0 then raise exception 'Non-admin deleted gallery';end if;
 begin insert into storage.objects(bucket_id,name) values('gallery-photos','gallery/'||repeat('c',64)||'/unauthorized-320.webp');raise exception 'Non-admin uploaded gallery asset';exception when insufficient_privilege then null;end;
 update storage.objects set name='gallery/'||repeat('c',64)||'/changed-320.webp' where name='gallery/'||repeat('a',64)||'/test-320.webp';get diagnostics modified=row_count;
 if modified<>0 then raise exception 'Non-admin replaced asset';end if;
 delete from storage.objects where name='gallery/'||repeat('a',64)||'/test-320.webp';get diagnostics modified=row_count;
 if modified<>0 then raise exception 'Non-admin removed asset';end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"81000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ declare modified integer;begin
 if not public.is_admin() then raise exception 'Approved gallery admin denied';end if;
 if not exists(select 1 from public.gallery_photos where id='82000000-0000-4000-8000-000000000002') then raise exception 'Admin cannot read drafts';end if;
 update public.gallery_photos set caption_ar='وصف معدّل',published=true,sort_order=7 where id='82000000-0000-4000-8000-000000000002';get diagnostics modified=row_count;
 if modified<>1 then raise exception 'Admin gallery save failed';end if;
 insert into storage.objects(bucket_id,name) values('gallery-photos','gallery/'||repeat('c',64)||'/admin-320.webp');
 delete from storage.objects where name='gallery/'||repeat('c',64)||'/admin-320.webp';
 delete from public.gallery_photos where id='82000000-0000-4000-8000-000000000002';
end $$;
reset role;
do $$ begin
 if public.valid_gallery_variants('{}'::jsonb) or public.valid_gallery_variants('{"thumbnails":[],"lightbox":{}}'::jsonb) then raise exception 'Invalid gallery variants accepted';end if;
 if not exists(select 1 from pg_class where relname='gallery_photos' and relrowsecurity) then raise exception 'Gallery RLS disabled';end if;
 if not exists(select 1 from storage.buckets where id='gallery-photos' and not public and file_size_limit=5242880) then raise exception 'Gallery bucket privacy missing';end if;
end $$;
rollback;
