import { expect } from '@playwright/test';
import { caseTest } from './caseTest';
import { TEST_LIB_CASE_CODES } from './testLibCaseCodes';

caseTest(
  {
    caseCode: TEST_LIB_CASE_CODES.PLAYWRIGHT_DOCS_HAS_TITLE,
    title: 'has title',
  },
  async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
  },
);

caseTest(
  {
    caseCode: TEST_LIB_CASE_CODES.PLAYWRIGHT_DOCS_GET_STARTED_LINK,
    title: 'get started link',
  },
  async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  },
);
