import { expect } from '@playwright/test';

export async function attachPageErrorCollector(page) {
  const errors = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
}

export async function expectNoClientErrors(errors) {
  expect(errors, `Unexpected page errors:\n${errors.join('\n')}`).toEqual([]);
}

export async function expectRouteToLoad(page, path, text) {
  await page.goto(path);
  await expect(page.locator('body')).toContainText(text);
  await expect(page.locator('body')).not.toContainText('Page Not Found');
}
