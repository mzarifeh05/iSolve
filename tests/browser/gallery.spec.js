import {test,expect} from '@playwright/test';

test('gallery metadata waits for viewport, paginates 6/6/6/6, and filters category pages',async({page},info)=>{
  const requests=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  expect(requests.some(url=>url.includes('/gallery-data/'))).toBe(false);
  await page.locator('.gallery-section').scrollIntoViewIfNeeded();
  await expect(page.locator('.gallery-card')).toHaveCount(6);
  expect(requests.filter(url=>url.includes('/gallery-data/')).every(url=>url.endsWith('/all-0.json'))).toBe(true);
  expect(requests.some(url=>/-full\.(webp|jpg)/.test(url))).toBe(false);
  await page.locator('.gallery-more button').click();await expect(page.locator('.gallery-card')).toHaveCount(12);
  await page.locator('.gallery-more button').click();await expect(page.locator('.gallery-card')).toHaveCount(18);
  await page.locator('.gallery-more button').click();await expect(page.locator('.gallery-card')).toHaveCount(24);
  await expect(page.locator('.gallery-more')).toHaveCount(0);
  await page.getByRole('button',{name:'التدريب',exact:true}).click();await expect(page.locator('.gallery-card')).toHaveCount(6);
  await page.locator('.gallery-more button').click();await expect(page.locator('.gallery-card')).toHaveCount(7);
  expect(requests.some(url=>url.endsWith('/training-0.json'))).toBe(true);
  await page.getByRole('button',{name:'مسابقة ZCC',exact:true}).click();await expect(page.locator('.gallery-card')).toHaveCount(6);
  await expect(page.locator('.gallery-more')).toBeVisible();
  await page.getByRole('button',{name:'لحظات النادي',exact:true}).click();await expect(page.locator('.gallery-card')).toHaveCount(5);
  expect(await page.locator('.gallery-card img').evaluateAll(images=>images.every(image=>getComputedStyle(image).objectFit==='contain'))).toBe(true);
  const columns=await page.locator('.gallery-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(info.project.name==='mobile'?1:3);
  await page.getByRole('button',{name:'التبديل إلى الإنجليزية'}).click();
  await expect(page.getByRole('button',{name:'Club Moments',exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.gallery-section').screenshot({path:`test-results/${info.project.name}-gallery.png`});
});

test('full images load only when opened, lightbox supports RTL keys, focus and Escape',async({page})=>{
  const requests=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');await page.locator('.gallery-section').scrollIntoViewIfNeeded();
  const first=page.locator('.gallery-open').first();await expect(first).toBeVisible();
  expect(requests.some(url=>/-full\.(webp|jpg)/.test(url))).toBe(false);
  await first.click();const dialog=page.locator('.gallery-lightbox');await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toBeVisible();
  await expect.poll(()=>requests.filter(url=>/-full\.(webp|jpg)/.test(url)).length).toBe(1);
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  const caption=await page.locator('#gallery-lightbox-caption').innerText();
  await page.keyboard.press('ArrowLeft');await expect(page.locator('#gallery-lightbox-caption')).not.toHaveText(caption);
  await page.keyboard.press('ArrowRight');await expect(page.locator('#gallery-lightbox-caption')).toHaveText(caption);
  await dialog.getByRole('button',{name:'أغلق الصورة'}).focus();await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button',{name:'الصورة التالية'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(first).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
});

test('mobile network uses thumbnails and defers later batches and full photos',async({page,context},info)=>{
  test.skip(info.project.name!=='mobile','Mobile network measurement.');test.setTimeout(90000);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:180000,uploadThroughput:90000});
  const responses=[];
  page.on('response',response=>{if(response.url().includes('/assets/gallery/'))responses.push(response);});
  await page.goto('/');await page.locator('.gallery-section').scrollIntoViewIfNeeded();
  await expect(page.locator('.gallery-card')).toHaveCount(6);
  await page.locator('.gallery-card').first().scrollIntoViewIfNeeded();
  await expect.poll(()=>responses.length,{timeout:30000}).toBeGreaterThan(0);
  const requests=responses.map(response=>response.url());
  expect(requests.every(url=>!url.includes('-full.'))).toBe(true);
  expect(requests.every(url=>/-(320|640|960)\.(webp|jpg)$/.test(url))).toBe(true);
  const widths=await page.locator('.gallery-card img').evaluateAll(images=>images.map(image=>image.currentSrc));
  const bytes=await Promise.all(responses.map(async response=>({url:response.url().split('/').at(-1),bytes:(await response.body()).length})));
  await test.info().attach('mobile-network.json',{body:JSON.stringify({latencyMs:120,downloadBytesPerSecond:180000,images:bytes,currentSources:widths},null,2),contentType:'application/json'});
});
