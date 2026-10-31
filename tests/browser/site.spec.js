import {test,expect} from '@playwright/test';
const form='https://docs.google.com/forms/d/e/1FAIpQLSfmiIE9gbBjrtwJJZUyu-Xt3sixIKz4x4dWZQuTbxZttrMG7A/viewform?usp=sharing&ouid=101765325223954785073';

test('one page has the requested order, both languages, working photos and no backend requests',async({page},info)=>{
  const errors=[],requests=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  expect(await page.locator('main>section').evaluateAll(sections=>sections.map(section=>section.id))).toEqual(['home','about','team','moments','registration','faq']);
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('.trainer-card')).toHaveCount(5);
  await expect(page.locator('.trainer-card').filter({hasText:'Rakan Alqhaiwi'}).locator('img')).toHaveAttribute('src','/assets/team/rakan-alqhaiwi.jpg');
  for(const image of await page.locator('.trainer-card img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);}
  const sizes=await page.locator('.trainer-card').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().height));expect(Math.max(...sizes)-Math.min(...sizes)).toBeLessThan(1);
  expect(new Set(await page.locator('.trainer-role').allTextContents()).size).toBe(1);
  for(const language of ['ar','en']){
    if(language==='en')await page.getByRole('button',{name:'التبديل إلى الإنجليزية'}).click();
    await expect(page.locator('html')).toHaveAttribute('dir',language==='en'?'ltr':'rtl');
    await expect(page.locator('.gathering-note')).toContainText(language==='en'?'Every Thursday':'كل يوم خميس');
    for(const id of ['home','about','team','moments','registration','faq']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id} ${language}`).toBe(true);}
    await page.locator('#home').evaluate(node=>node.scrollIntoView({behavior:'instant'}));await page.screenshot({path:`test-results/${info.project.name}-${language}-hero.png`});
  }
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('#team').scrollIntoViewIfNeeded();
  for(const photo of await page.locator('.trainer-card img').all())await photo.evaluate(image=>image.decode());
  await page.locator('#team').screenshot({path:`test-results/${info.project.name}-team.png`});
  await expect(page.locator('a[href^="/admin"],input[type=password],.demo-banner,.admin-link')).toHaveCount(0);
  expect(requests.some(url=>/supabase|\/rest\/v1\/|\/auth\/v1\//.test(url))).toBe(false);expect(errors).toEqual([]);
});

test('navigation scrolls under the sticky header and registration is always reachable',async({page},info)=>{
  await page.goto('/');await page.emulateMedia({reducedMotion:'reduce'});
  const header=page.locator('.site-header');await expect(header).toHaveCSS('position','sticky');
  const register=header.locator('.registration-button');await expect(register).toBeVisible();await expect(register).toHaveAttribute('href',form);await expect(register).toHaveAttribute('target','_blank');
  const mobile=info.project.name==='mobile';
  if(mobile){await page.getByRole('button',{name:'افتح قائمة التنقل'}).click();await page.keyboard.press('Tab');await expect(page.locator('#main-navigation a').first()).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'افتح قائمة التنقل'})).toBeFocused();}
  const hrefs=['#about','#team','#moments','#registration','#faq'];
  for(const href of hrefs){
    if(mobile)await page.getByRole('button',{name:'افتح قائمة التنقل'}).click();
    await page.locator(`#main-navigation a[href="${href}"]`).click();await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect.poll(async()=>{const target=await page.locator(href).boundingBox();const head=await header.boundingBox();return target.y>=head.height-1&&target.y<head.height+55;}).toBe(true);
    await expect(register).toBeInViewport();
    if(mobile)await expect(page.locator('#main-navigation')).toBeHidden();
  }
  await page.locator('.back-to-top').click();await expect(page).toHaveURL(/#home$/);
  const buttons=page.locator('.registration-button');await expect(buttons).toHaveCount(6);
  await expect(page.locator('#about .registration-button,#team .registration-button')).toHaveCount(0);
  for(const button of await buttons.all())await expect(button).toHaveAttribute('href',form);
  await page.locator('.faq-list summary').first().click();await expect(page.locator('.faq-list details').first()).toHaveAttribute('open','');
  expect(await page.locator('.footer-socials a').evaluateAll(links=>links.map(link=>link.href))).toEqual(['https://www.instagram.com/iteamzuj/','https://www.facebook.com/search/top?q=iteam%20-%20zuj','https://www.linkedin.com/company/iteamzuj/posts/?feedView=all']);
});

test('header and footer use the transparent logo; narrow phones and old bookmarks work',async({page})=>{
  await page.goto('/');
  for(const logo of await page.locator('.brand img').all()){await expect(logo).toHaveAttribute('src','/assets/isolve-logo-transparent.png');await logo.scrollIntoViewIfNeeded();await expect.poll(()=>logo.evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);}
  await page.setViewportSize({width:320,height:800});await page.goto('/');await expect(page.locator('.header-register')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  for(const [path,id] of [['/about','about'],['/team','team'],['/join','registration']]){await page.goto(path);await expect(page).toHaveURL(new RegExp(`/#${id}$`));await expect(page.locator(`#${id}`)).toBeVisible();}
  await page.goto('/admin');await expect(page).toHaveURL(/\/$/);await expect(page.locator('input,.admin-state')).toHaveCount(0);await expect(page.locator('.hero-title')).toBeVisible();
});
