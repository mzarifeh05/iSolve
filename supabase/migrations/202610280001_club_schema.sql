-- Initial schema for a NEW, not-yet-configured Supabase project only.
-- Do not apply to unrelated databases or databases with an older applied schema.
begin;

create table public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from public, anon, authenticated;
-- No client membership grants/policies. Membership is managed only by a trusted
-- database owner; public team roles and editable metadata do not grant access.

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admin_members where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create function public.is_web_url(value text) returns boolean
language sql immutable set search_path = ''
as $$ select value is null or value ~ '^https?://[^[:space:]@/]+([/?#][^[:space:]]*)?$'; $$;

create function public.is_team_photo_url(value text) returns boolean
language sql immutable set search_path = ''
as $$ select public.is_web_url(value)
  or value ~ '^/assets/team/[a-z0-9]+(-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$'; $$;

create function public.is_google_form_url(value text, embedded boolean default false) returns boolean
language sql immutable set search_path = ''
as $$
  select value is null or (
    (not embedded and value ~ '^https://forms\.gle/[A-Za-z0-9_-]+/?(\?[^[:space:]#]*)?$')
    or (value ~ '^https://docs\.google\.com/forms/(u/[0-9]+/)?d/(e/)?[A-Za-z0-9_-]+/viewform/?(\?[^[:space:]#]*)?$'
      and (not embedded or (value ~ '[?&]embedded=true(&|$)'
        and (select count(*) from unnest(string_to_array(split_part(value, '?', 2), '&')) as params(param)
          where split_part(param, '=', 1) = 'embedded') = 1)))
  );
$$;

create function public.is_whatsapp_url(value text) returns boolean
language sql immutable set search_path = ''
as $$ select value is null or value ~ '^https://chat\.whatsapp\.com/[A-Za-z0-9]{8,64}/?(\?[^[:space:]#]*)?$'; $$;

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  name_en text not null default '', name_ar text not null default '',
  role_en text not null default 'Team Member', role_ar text not null default 'عضو الفريق',
  bio_en text not null default '', bio_ar text not null default '',
  photo_url text, photo_path text,
  codeforces_url text, github_url text, linkedin_url text,
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint trainer_name_required check (length(trim(name_en)) > 0 or length(trim(name_ar)) > 0),
  constraint trainer_names_length check (length(name_en) <= 160 and length(name_ar) <= 160),
  constraint trainer_photo_path check (photo_path is null or photo_path ~ '^trainers/[a-f0-9-]+\.(jpg|png|webp)$'),
  constraint trainer_photo_url check (public.is_team_photo_url(photo_url)),
  constraint trainer_links check (public.is_web_url(codeforces_url) and public.is_web_url(github_url) and public.is_web_url(linkedin_url))
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null default '', question_ar text not null default '',
  answer_en text not null default '', answer_ar text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint faq_question_required check (length(trim(question_en)) > 0 or length(trim(question_ar)) > 0),
  constraint faq_answer_required check (length(trim(answer_en)) > 0 or length(trim(answer_ar)) > 0)
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  registration_open boolean not null default false,
  registration_url text, registration_embed_url text,
  contact_email text check (contact_email is null or contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  instagram_url text, facebook_url text, linkedin_url text, github_url text, whatsapp_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint registration_link_valid check (public.is_google_form_url(registration_url)),
  constraint registration_embed_valid check (public.is_google_form_url(registration_embed_url, true)),
  constraint whatsapp_invite_valid check (public.is_whatsapp_url(whatsapp_url)),
  constraint open_registration_has_form check (not registration_open or registration_url is not null),
  constraint settings_social_links check (public.is_web_url(instagram_url) and public.is_web_url(facebook_url) and public.is_web_url(linkedin_url) and public.is_web_url(github_url))
);
insert into public.site_settings(id) values (1);

create index trainers_public_order on public.trainers(published, sort_order);
create index faqs_public_order on public.faqs(published, sort_order);

do $$ declare table_name text; begin
  foreach table_name in array array['trainers', 'faqs'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy public_published on public.%I for select to anon, authenticated using (published)', table_name);
    execute format('create policy admin_manage on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', table_name);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name);
  end loop;
end $$;

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
revoke delete on public.site_settings from anon, authenticated;
create policy public_settings on public.site_settings for select to anon, authenticated using (id = 1);
create policy admin_settings on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create trigger touch_updated_at before update on public.site_settings for each row execute function public.touch_updated_at();

commit;
