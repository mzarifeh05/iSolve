-- ZCC means Zaytoonah Coding Contest. Keep winner captions free of standings.
begin;
update public.gallery_photos set caption_en='Celebrating the winners',caption_ar='نحتفل بالفائزين',
 alt_en=case slug
  when 'zcc-first-place' then 'Three students wearing medals during an awards presentation between two presenters'
  when 'zcc-second-place' then 'Three students wearing medals and holding a card during an awards presentation'
  else 'Three students wearing medals with a card held during an awards presentation' end,
 alt_ar=case slug
  when 'zcc-first-place' then 'ثلاثة طلاب يرتدون ميداليات أثناء التكريم بين شخصين يقدّمان التكريم'
  else 'ثلاثة طلاب يرتدون ميداليات ويحملون بطاقة أثناء التكريم' end
where slug in ('zcc-first-place','zcc-second-place','zcc-third-place');
update public.gallery_photos set caption_en=replace(caption_en,'ZCC','ZCC Contest')
where category='zcc' and caption_en like '%ZCC%' and caption_en not like '%ZCC Contest%';
update public.gallery_photos set caption_ar=replace(caption_ar,'ZCC','مسابقة ZCC')
where category='zcc' and caption_ar like '%ZCC%' and caption_ar not like '%مسابقة ZCC%';
update public.gallery_photos set alt_en=replace(alt_en,'ZCC','ZCC Contest')
where category='zcc' and alt_en like '%ZCC%' and alt_en not like '%ZCC Contest%';
update public.gallery_photos set alt_ar=replace(alt_ar,'ZCC','مسابقة ZCC')
where category='zcc' and alt_ar like '%ZCC%' and alt_ar not like '%مسابقة ZCC%';
commit;
