import { test, expect } from '@playwright/test';

test('production shows confirmed content while admin remains unconfigured', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('.demo-banner')).toHaveCount(0);
  await expect(page.locator('.trainer-card')).toHaveCount(5);
  for (const path of ['/about', '/team', '/join', '/admin', '/missing']) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.demo-banner')).toHaveCount(0);
  }
  await page.goto('/admin');
  await expect(page.locator('.admin-state')).toContainText('Supabase');
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  await page.getByRole('button', { name: 'التبديل إلى الإنجليزية' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('.admin-state')).toContainText('Connect Supabase');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

test('demo admin includes gallery controls and cannot save', async ({ page }) => {
  await page.goto('http://127.0.0.1:5181/admin');
  await expect(page.locator('.demo-banner')).toBeVisible();
  await expect(page.locator('.admin-tabs button')).toHaveCount(4);
  await expect(page.locator('.admin-record')).toHaveCount(5);
  await page.locator('.admin-tabs button').nth(2).click();
  await expect(page.locator('.admin-gallery .admin-record')).toHaveCount(6);
  await page.locator('.admin-gallery .admin-record').first().getByRole('button',{name:'تعديل'}).click();
  await expect(page.locator('.admin-gallery input[type=file]')).toBeDisabled();
  await expect(page.locator('.admin-gallery .admin-form-actions button')).toBeDisabled();
  await page.locator('.admin-tabs button').last().click();
  await expect(page.locator('.admin-editor')).toBeVisible();
  await expect(page.locator('.admin-form-actions button')).toBeDisabled();
});
