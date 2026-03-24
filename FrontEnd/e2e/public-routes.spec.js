import { test } from '@playwright/test';
import { attachPageErrorCollector, expectNoClientErrors, expectRouteToLoad } from './helpers';

const publicRoutes = [
  ['/', 'CAR EASE'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/rentals', 'Rentals'],
  ['/car-wash', 'Car Wash'],
  ['/repairs', 'Repairs'],
  ['/sales', 'Sales'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/cancellation', 'Cancellation'],
  ['/cookies', 'Cookie'],
  ['/faq', 'FAQ'],
  ['/careers', 'Join the'],
  ['/press', 'Press'],
  ['/sitemap', 'Sitemap'],
  ['/profile', 'My Profile'],
  ['/my-bookings', 'My Bookings'],
  ['/wishlist', 'Wishlist']
];

for (const [path, expectedText] of publicRoutes) {
  test(`public route ${path} loads`, async ({ page }) => {
    const errors = await attachPageErrorCollector(page);
    await expectRouteToLoad(page, path, expectedText);
    await expectNoClientErrors(errors);
  });
}
