import { test, expect } from '@playwright/test';
import { attachPageErrorCollector, expectNoClientErrors } from './helpers';

const demoAdmin = {
  email: 'admin@carease.co.ke',
  password: 'admin123'
};

test('demo admin can log in and open key admin sections', async ({ page }) => {
  const errors = await attachPageErrorCollector(page);

  await page.goto('/admin-login');
  await page.locator('input[name="email"]').fill(demoAdmin.email);
  await page.locator('input[name="password"]').fill(demoAdmin.password);
  await page.getByRole('button', { name: /login to dashboard/i }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator('body')).toContainText(/Dashboard|Welcome back/i);

  const sections = [
    ['/admin/bookings', 'Bookings'],
    ['/admin/payments', 'Payments'],
    ['/admin/vehicles', 'Vehicles'],
    ['/admin/reports', 'Reports'],
    ['/admin/notifications', 'Notifications'],
    ['/admin/settings', 'Admin Settings'],
    ['/admin/audit-logs', 'Audit Logs']
  ];

  for (const [path, text] of sections) {
    await page.goto(path);
    await expect(page.locator('body')).toContainText(text);
  }

  await expectNoClientErrors(errors);
});
