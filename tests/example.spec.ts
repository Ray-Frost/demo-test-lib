import { expect, test } from '@playwright/test';
import { caseDetails } from './caseDetails';
import { TEST_LIB_CASE_CODES } from './testLibCaseCodes';

test(
  'has title',
  caseDetails(TEST_LIB_CASE_CODES.PLAYWRIGHT_DOCS_HAS_TITLE),
  async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  },
);

test(
  'get started link',
  caseDetails(TEST_LIB_CASE_CODES.PLAYWRIGHT_DOCS_GET_STARTED_LINK),
  async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(
      page.getByRole('heading', { name: 'Installation' }),
    ).toBeVisible();
  },
);
