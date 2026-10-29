import {test,expect} from '@playwright/test';

test('tablet frames, portrait lightbox and gallery layout stay stable',async({page})=>{
  await page.setViewportSize({width:820,height:1000});
  await page.addInitScript(()=>{
    window.galleryShift=0;
    new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput&&entry.sources?.some(source=>source.node?.closest?.('.gallery-section')))window.galleryShift+=entry.value;}).observe({type:'layout-shift',buffered:true});
  });
  await page.goto('/');await page.locator('.gallery-section').scrollIntoViewIfNeeded();await expect(page.locator('.gallery-card')).toHaveCount(6);
  expect(await page.locator('.gallery-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(2);
  for(const frame of await page.locator('.gallery-frame').all()){
    const box=await frame.boundingBox();expect(box.width/box.height).toBeCloseTo(1.5,1);
  }
  await page.getByRole('button',{name:'مسابقة ZCC',exact:true}).click();await expect(page.locator('.gallery-card')).toHaveCount(6);
  await page.locator('.gallery-more button').click();await expect(page.locator('.gallery-card')).toHaveCount(8);
  const portrait=page.locator('.gallery-card').filter({has:page.locator('img[src*="zcc-friendly-moment"]')});
  await expect(portrait).toHaveCount(1);await expect(portrait.locator('img')).toHaveCSS('object-fit','contain');
  await portrait.locator('button').click();const full=page.locator('.gallery-lightbox img');await expect(full).toBeVisible();
  await expect.poll(()=>full.evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
  expect(await full.evaluate(image=>image.naturalWidth<image.naturalHeight)).toBe(true);
  await expect(full).toHaveCSS('object-fit','contain');await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>window.galleryShift)).toBeLessThan(.02);
});
