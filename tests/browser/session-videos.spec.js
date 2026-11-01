import {test,expect} from '@playwright/test';

test('session highlights defer videos, play both real clips and keep the motto in both languages',async({page},info)=>{
  const requests=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.session-highlights').scrollIntoViewIfNeeded();
  await expect(page.locator('.session-video-preview')).toHaveCount(2);
  await expect(page.locator('.community-motto blockquote')).toHaveText("Once you're iTeam, You're always iTeam");
  await expect(page.locator('#moments video')).toHaveCount(0);
  expect(requests.some(url=>/\.mp4(?:$|\?)/.test(url))).toBe(false);
  const newPhotos=['finding-the-solution','trainees-and-trainers','guided-practice','ideas-in-the-room'];
  for(const slug of newPhotos){
    const photo=page.locator(`.gallery-card img[src*="${slug}"]`);
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(()=>photo.evaluate(node=>node.complete&&node.naturalWidth>0)).toBe(true);
    await expect(photo).toHaveCSS('object-fit','contain');
  }
  for(const [index,expectedDuration] of [[0,9.77],[1,16.33]]){
    const card=page.locator('.session-video-card').nth(index);
    await card.locator('.session-video-preview').click();
    const player=card.locator('video');
    await expect(player).toHaveAttribute('controls','');await expect(player).toHaveAttribute('playsinline','');
    await expect.poll(()=>player.evaluate(node=>node.currentTime),{timeout:15000}).toBeGreaterThan(.15);
    const data=await player.evaluate(node=>({duration:node.duration,width:node.videoWidth,height:node.videoHeight}));
    expect(data.duration).toBeCloseTo(expectedDuration,1);expect(data.width).toBeLessThan(data.height);
    if(index===1)expect(await page.locator('.session-video-card').first().locator('video').evaluate(node=>node.paused)).toBe(true);
  }
  await page.locator('#registration').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('#moments video').evaluateAll(players=>players.every(player=>player.paused))).toBe(true);
  await page.getByRole('button',{name:'التبديل إلى الإنجليزية'}).click();
  await expect(page.locator('#session-highlights-title')).toHaveText('A little glimpse of a Thursday.');
  await expect(page.locator('.session-video-caption h3').first()).toHaveText('New ideas, explained together');
  await expect(page.locator('.community-motto blockquote')).toHaveText("Once you're iTeam, You're always iTeam");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.reload();await page.locator('.session-highlights').scrollIntoViewIfNeeded();
  await page.locator('.session-highlights img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.locator('.session-highlights').screenshot({path:`test-results/${info.project.name}-session-highlights.png`});
});

test('a failed video offers a retry that can recover playback',async({page})=>{
  await page.route('**/assets/sessions/session-explanation-*.mp4',route=>route.abort(),{times:1});
  await page.goto('/');await page.locator('.session-video-preview').first().click();
  const card=page.locator('.session-video-card').first();
  await expect(card.locator('[role=alert]')).toBeVisible();
  await card.getByRole('button',{name:'حاول مجددًا'}).click();
  await card.locator('.session-video-preview').click();
  await expect.poll(()=>card.locator('video').evaluate(node=>node.currentTime),{timeout:15000}).toBeGreaterThan(.15);
});
