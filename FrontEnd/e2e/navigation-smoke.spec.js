import { test, expect } from '@playwright/test';
import { attachPageErrorCollector, expectNoClientErrors } from './helpers';

test('top navigation links work from the homepage', async ({ page }) => {
  const errors = await attachPageErrorCollector(page);

  await page.goto('/');
  await page.getByRole('link', { name: /services/i }).first().click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.locator('body')).toContainText(/Services/i);

  await page.getByRole('link', { name: /about/i }).first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('body')).toContainText(/About/i);

  await page.getByRole('link', { name: /contact/i }).first().click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('body')).toContainText(/Contact/i);

  await expectNoClientErrors(errors);
});

test('sitemap exposes clickable internal routes', async ({ page }) => {
  const errors = await attachPageErrorCollector(page);

  await page.goto('/sitemap');
  await page.getByRole('link', { name: 'Audit Logs' }).click();
  await expect(page).toHaveURL(/\/admin\/audit-logs$/);

  await page.goto('/sitemap');
  await page.getByRole('link', { name: 'Cookies' }).click();
  await expect(page).toHaveURL(/\/cookies$/);

  await expectNoClientErrors(errors);
});
