import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { caseTest } from './caseTest';
import { TEST_LIB_CASE_CODES } from './testLibCaseCodes';

caseTest(
  {
    caseCode: TEST_LIB_CASE_CODES.AUTH_LOGIN_SUCCESS_ADD_ASSET,
    title: 'User logs in successfully and clicks Add Asset',
  },
  async ({ page }) => {
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
  },
);
