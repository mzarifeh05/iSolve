-- The supplied registration link opens Google's form; no duplicate student records.
begin;
update public.site_settings set registration_open=true,
 registration_url='https://docs.google.com/forms/d/e/1FAIpQLSfmiIE9gbBjrtwJJZUyu-Xt3sixIKz4x4dWZQuTbxZttrMG7A/viewform?usp=sharing&ouid=101765325223954785073'
where id=1;
commit;
