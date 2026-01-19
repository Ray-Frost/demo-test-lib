import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('User logs in successfully and clicks Add Asset', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  // 1. Navigate to Login Page
  await loginPage.goto();

  // 2. Perform Login
  await loginPage.login('admin', 'password');

  // 3. Verify Dashboard is visible
  await dashboardPage.verifyDashboardVisible();

  // 4. Click Add Asset
  await dashboardPage.clickAddAsset();
});
