begin;
create function public.valid_gallery_variants(value jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb;
begin
  if value is null or not (value ?& array['thumbnails','lightbox']) then return false; end if;
  if jsonb_typeof(value)<>'object' or jsonb_typeof(value->'thumbnails')<>'array'
    or jsonb_array_length(value->'thumbnails') not between 1 and 3
    or jsonb_typeof(value->'lightbox')<>'object' then return false; end if;
  for item in select * from jsonb_array_elements((value->'thumbnails') || jsonb_build_array(value->'lightbox')) loop
    if not (item ?& array['path','fallback_path','width','height'])
      or jsonb_typeof(item->'path')<>'string' or jsonb_typeof(item->'fallback_path')<>'string'
      or jsonb_typeof(item->'width')<>'number' or jsonb_typeof(item->'height')<>'number'
      or (item->>'path') !~ '^gallery/[a-f0-9]{64}/[a-z0-9-]+\.webp$'
      or (item->>'fallback_path') !~ '^gallery/[a-f0-9]{64}/[a-z0-9-]+\.jpg$'
      or (item->>'width')::integer not between 1 and 1920
      or (item->>'height')::integer not between 1 and 6000 then return false; end if;
  end loop;
  if (value->'lightbox'->>'height')::integer>1920 then return false; end if;
  for item in select * from jsonb_array_elements(value->'thumbnails') loop
    if (item->>'width')::integer>960 then return false; end if;
  end loop;
  return true;
exception when others then return false;
end $$;
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content_hash text not null unique check(content_hash ~ '^[a-f0-9]{64}$'),
  variants jsonb not null check(public.valid_gallery_variants(variants)),
  caption_en text not null default '',caption_ar text not null default '',alt_en text not null default '',alt_ar text not null default '',
  category text not null check(category in ('training','zcc','moments')),
  event_label_en text not null default '',event_label_ar text not null default '',event_date date,
  sort_order integer not null default 0 check(sort_order between 0 and 1000000),published boolean not null default false,
  fit text not null default 'contain' check(fit in ('contain','cover')),
  focal_x integer not null default 50 check(focal_x between 0 and 100),focal_y integer not null default 50 check(focal_y between 0 and 100),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  constraint gallery_caption_required check(length(trim(caption_en))>0 or length(trim(caption_ar))>0),
  constraint gallery_alt_required check(length(trim(alt_en))>0 or length(trim(alt_ar))>0),
  constraint gallery_text_limits check(length(caption_en)<=500 and length(caption_ar)<=500 and length(alt_en)<=1000 and length(alt_ar)<=1000)
);
alter table public.gallery_photos enable row level security;
grant select on public.gallery_photos to anon,authenticated;
grant insert,update,delete on public.gallery_photos to authenticated;
create policy gallery_public on public.gallery_photos for select to anon,authenticated using(published);
create policy gallery_admin on public.gallery_photos for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create trigger touch_updated_at before update on public.gallery_photos for each row execute function public.touch_updated_at();
create index gallery_public_order on public.gallery_photos(published,sort_order,id);
create index gallery_category_order on public.gallery_photos(published,category,sort_order,id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('gallery-photos','gallery-photos',false,5242880,array['image/jpeg','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/webp'];
create policy gallery_public_assets on storage.objects for select to anon,authenticated using(
  bucket_id='gallery-photos' and exists(select 1 from public.gallery_photos g where g.published and (
    g.variants->'lightbox'->>'path'=name or g.variants->'lightbox'->>'fallback_path'=name
    or exists(select 1 from jsonb_array_elements(g.variants->'thumbnails') image where image->>'path'=name or image->>'fallback_path'=name)
  ))
);
create policy gallery_admin_assets on storage.objects for select to authenticated using(bucket_id='gallery-photos' and (select public.is_admin()));
create policy gallery_admin_upload on storage.objects for insert to authenticated with check(bucket_id='gallery-photos' and (select public.is_admin()) and name ~ '^gallery/[a-f0-9]{64}/[a-z0-9-]+\.(webp|jpg)$');
create policy gallery_admin_update on storage.objects for update to authenticated using(bucket_id='gallery-photos' and (select public.is_admin())) with check(bucket_id='gallery-photos' and (select public.is_admin()) and name ~ '^gallery/[a-f0-9]{64}/[a-z0-9-]+\.(webp|jpg)$');
create policy gallery_admin_delete on storage.objects for delete to authenticated using(bucket_id='gallery-photos' and (select public.is_admin()));
commit;
