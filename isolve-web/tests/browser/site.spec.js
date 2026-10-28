import { test, expect } from '@playwright/test';

const names = ['Mohammed Zarifeh', 'Leena Aburahmeh', 'Yomna Aljabiri', 'Hala Darwish', 'Rakan Alqhaiwi'];

test('Arabic first, all four pages fit desktop and mobile in both languages', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  for (const language of ['ar', 'en']) {
    if (language === 'en') await page.getByRole('button', { name: 'التبديل إلى الإنجليزية' }).click();
    for (const path of ['/', '/about', '/team', '/join']) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} ${language}`).toBe(true);
      expect(await page.locator('main').innerText()).not.toMatch(/(?:home|about|team|common|join)\.[A-Za-z]+/);
      if (path === '/') await page.screenshot({ path: `test-results/${testInfo.project.name}-${language}-hero.png`, fullPage: false });
    }
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.evaluate(() => localStorage.getItem('isolve-language'))).toBe('en');
  expect(errors).toEqual([]);
});

test('all five members receive equal cards and working supplied portraits', async ({ page }) => {
  for (const route of ['/', '/team']) {
    await page.goto(route);
    const cards = page.locator('.trainer-card');
    await expect(cards).toHaveCount(5);
    expect(await cards.locator('h3').allTextContents()).toEqual(names);
    for (const photo of await cards.locator('img').all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    const sizes = await cards.evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { width: r.width, height: r.height }; }));
    expect(Math.max(...sizes.map(size => size.width)) - Math.min(...sizes.map(size => size.width))).toBeLessThan(1);
    expect(Math.max(...sizes.map(size => size.height)) - Math.min(...sizes.map(size => size.height))).toBeLessThan(1);
    const roleLabels = await cards.locator('.trainer-role').allTextContents();
    expect(new Set(roleLabels).size).toBe(1);
  }
});

test('four-link navigation, registration and contact links are honest', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'افتح قائمة التنقل' }).click();
    await page.keyboard.press('Tab');
    await expect(page.locator('#main-navigation a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'افتح قائمة التنقل' })).toBeFocused();
    await page.getByRole('button', { name: 'افتح قائمة التنقل' }).click();
  }
  await expect(page.locator('#main-navigation a')).toHaveCount(4);
  expect(await page.locator('#main-navigation a').evaluateAll(elements => elements.map(element => element.getAttribute('href')))).toEqual(['/', '/about', '/team', '/join']);
  await page.locator('#main-navigation a[href="/join"]').click();
  await expect(page).toHaveURL(/\/join$/);
  await expect(page.locator('.join-panel a[href*="docs.google.com/forms"]')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('a[href*="chat.whatsapp.com"]')).toHaveCount(0);
  const contacts = page.locator('.contact-links a');
  await expect(contacts).toHaveCount(3);
  expect(await contacts.evaluateAll(elements => elements.map(element => element.getAttribute('href')))).toEqual(['https://www.instagram.com/iteamzuj/', 'https://www.facebook.com/search/top?q=iteam%20-%20zuj', 'https://www.linkedin.com/company/iteamzuj/posts/?feedView=all']);
  await expect(page.locator('.faq-list details')).toHaveCount(5);
  await page.locator('.faq-list summary').first().click();
  await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
});

test('retired URLs show the useful 404 and no current links point to them', async ({ page }) => {
  for (const path of ['/sessions', '/sessions/old', '/learning-path', '/resources']) {
    await page.goto(path);
    await expect(page.locator('.not-found')).toBeVisible();
    await expect(page.locator('.not-found a')).toHaveAttribute('href', '/');
  }
  await page.goto('/');
  await expect(page.locator('a[href^="/sessions"],a[href^="/resources"],a[href^="/learning-path"]')).toHaveCount(0);
});
