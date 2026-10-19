import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Globus/);
});

test('app redirects to globus login if not authenticated', async ({ page }) => {
  await page.goto('/upload');

  // Check that we are redirected to Globus
  await expect(page).toHaveURL(/auth\.globus\.org/);
});
