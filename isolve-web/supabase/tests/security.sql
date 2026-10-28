-- Run as database owner in an isolated configured Supabase database after all migrations.
-- Tests real anon/authenticated roles and JWT claims. All fixtures roll back.
begin;
insert into auth.users(id, email) values
  ('10000000-0000-4000-8000-000000000001', 'isolve-security-admin@example.invalid'),
  ('10000000-0000-4000-8000-000000000002', 'isolve-security-member@example.invalid');
insert into public.admin_members(user_id) values ('10000000-0000-4000-8000-000000000001');
insert into public.trainers(id, name_en, published, photo_path) values
  ('20000000-0000-4000-8000-000000000001', 'Security test published', true, 'trainers/20000000-0000-4000-8000-000000000001.png'),
  ('20000000-0000-4000-8000-000000000002', 'Security test draft', false, 'trainers/20000000-0000-4000-8000-000000000002.png');
insert into public.faqs(id, question_en, answer_en, published) values
  ('30000000-0000-4000-8000-000000000001', 'Published question', 'Published answer', true),
  ('30000000-0000-4000-8000-000000000002', 'Draft question', 'Draft answer', false);
insert into storage.objects(bucket_id, name) values
  ('trainer-photos', 'trainers/20000000-0000-4000-8000-000000000001.png'),
  ('trainer-photos', 'trainers/20000000-0000-4000-8000-000000000002.png');

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  if public.is_admin() then raise exception 'Anonymous user has administrator access'; end if;
  if exists(select 1 from public.trainers where id = '20000000-0000-4000-8000-000000000002')
    or exists(select 1 from public.faqs where id = '30000000-0000-4000-8000-000000000002') then
    raise exception 'Anonymous user can read draft content'; end if;
  if not exists(select 1 from public.trainers where id = '20000000-0000-4000-8000-000000000001')
    or not exists(select 1 from public.faqs where id = '30000000-0000-4000-8000-000000000001') then
    raise exception 'Anonymous user cannot read published content'; end if;
  if exists(select 1 from storage.objects where name = 'trainers/20000000-0000-4000-8000-000000000002.png') then
    raise exception 'Anonymous user can read draft photo'; end if;
  if not exists(select 1 from storage.objects where name = 'trainers/20000000-0000-4000-8000-000000000001.png') then
    raise exception 'Published trainer photo is not readable'; end if;
  begin
    insert into public.trainers(name_en) values ('Must fail');
    raise exception 'Anonymous team insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.faqs(question_en, answer_en) values ('Must fail', 'Must fail');
    raise exception 'Anonymous FAQ insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.admin_members(user_id) values ('10000000-0000-4000-8000-000000000002');
    raise exception 'Anonymous membership insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","user_metadata":{"is_admin":true,"role":"admin"}}', true);
do $$ declare modified integer; begin
  if public.is_admin() then raise exception 'Editable profile metadata granted administrator access'; end if;
  begin
    insert into public.trainers(name_en) values ('Must fail');
    raise exception 'Non-admin team insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.faqs(question_en, answer_en) values ('Must fail', 'Must fail');
    raise exception 'Non-admin FAQ insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  update public.trainers set name_en = 'Must not change' where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin team update succeeded'; end if;
  delete from public.trainers where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin team deletion succeeded'; end if;
  update public.faqs set answer_en = 'Must not change' where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin FAQ update succeeded'; end if;
  delete from public.faqs where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin FAQ deletion succeeded'; end if;
  update public.site_settings set contact_email = 'must-not-save@example.invalid' where id = 1;
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin settings update succeeded'; end if;
  begin
    insert into public.admin_members(user_id) values ('10000000-0000-4000-8000-000000000002');
    raise exception 'Non-admin membership insert unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects(bucket_id, name) values ('trainer-photos', 'trainers/20000000-0000-4000-8000-000000000003.png');
    raise exception 'Non-admin photo upload unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  update storage.objects set name = 'trainers/20000000-0000-4000-8000-000000000004.png'
    where name = 'trainers/20000000-0000-4000-8000-000000000001.png';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin photo update succeeded'; end if;
  delete from storage.objects where name = 'trainers/20000000-0000-4000-8000-000000000001.png';
  get diagnostics modified = row_count;
  if modified <> 0 then raise exception 'Non-admin photo deletion succeeded'; end if;
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$ declare modified integer; begin
  if not public.is_admin() then raise exception 'Trusted membership did not grant administrator access'; end if;
  if not exists(select 1 from public.trainers where id = '20000000-0000-4000-8000-000000000002')
    or not exists(select 1 from public.faqs where id = '30000000-0000-4000-8000-000000000002') then
    raise exception 'Administrator cannot read drafts'; end if;
  if not exists(select 1 from storage.objects where name = 'trainers/20000000-0000-4000-8000-000000000002.png') then
    raise exception 'Administrator cannot read draft photos'; end if;
  update public.trainers set bio_en = 'Security test update' where id = '20000000-0000-4000-8000-000000000002';
  get diagnostics modified = row_count;
  if modified <> 1 then raise exception 'Administrator team edit failed'; end if;
  update public.faqs set published = true where id = '30000000-0000-4000-8000-000000000002';
  get diagnostics modified = row_count;
  if modified <> 1 then raise exception 'Administrator FAQ publish failed'; end if;
  update public.site_settings set contact_email = 'security-test@example.invalid' where id = 1;
  get diagnostics modified = row_count;
  if modified <> 1 then raise exception 'Administrator settings edit failed'; end if;
  insert into storage.objects(bucket_id, name) values ('trainer-photos', 'trainers/20000000-0000-4000-8000-000000000003.png');
  delete from storage.objects where name = 'trainers/20000000-0000-4000-8000-000000000003.png';
  delete from public.faqs where id = '30000000-0000-4000-8000-000000000002';
end $$;

reset role;
do $$ begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('admin_members', 'trainers', 'faqs', 'site_settings') and not c.relrowsecurity)
  then raise exception 'An exposed table does not enable RLS'; end if;
  if not exists (select 1 from storage.buckets where id = 'trainer-photos' and not public
    and file_size_limit = 3145728 and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'])
  then raise exception 'Trainer bucket privacy, size, or MIME limits are incorrect'; end if;
  if not public.is_team_photo_url('/assets/team/leena-aburahmeh.png')
    or public.is_team_photo_url('/assets/team/../private.png')
    or public.is_team_photo_url('/assets/team/script.svg') then raise exception 'Bundled photo path validation is incorrect'; end if;
  if public.is_whatsapp_url('https://chat.whatsapp.com.evil.invalid/InviteAbc123')
    or public.is_whatsapp_url('http://chat.whatsapp.com/InviteAbc123')
    or not public.is_whatsapp_url('https://chat.whatsapp.com/InviteAbc123') then raise exception 'WhatsApp invite validation is incorrect'; end if;
  if not public.is_google_form_url('https://docs.google.com/forms/d/e/AbC123/viewform?embedded=true', true)
    or public.is_google_form_url('https://docs.google.com/forms/d/e/AbC123/viewform?embedded=false&embedded=true', true)
    or public.is_google_form_url('https://docs.google.com/forms/d/e/AbC123/viewform?embedded=true&embedded=true', true)
    or public.is_google_form_url('https://docs.google.com/forms/d/e/AbC123/viewform?embedded&embedded=true', true)
  then raise exception 'Google embed parameter validation is incorrect'; end if;
end $$;
rollback;
-- Success completes without errors and leaves no test users/content behind.
