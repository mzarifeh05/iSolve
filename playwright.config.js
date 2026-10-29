import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'chrome', headless: true, locale:'en-US' },
  projects: [
    { name: 'desktop', testIgnore: '**/production.spec.js', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', testIgnore: '**/production.spec.js', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'production', testMatch: '**/production.spec.js', use: { baseURL:'http://127.0.0.1:4173',viewport: { width:1440,height:1000 } } },
  ],
  webServer: [
    { command: 'npm run dev:demo -- --port 5181 --strictPort', url: 'http://127.0.0.1:5181', reuseExistingServer: !process.env.CI },
    { command: 'npm run dev -- --port 5174', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
    { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
  ],
});
