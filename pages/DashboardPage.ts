import { type Locator, type Page, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly assetTable: Locator;
  readonly addAssetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.assetTable = page.getByTestId('asset-table');
    this.addAssetButton = page.getByTestId('add-asset-btn');
  }

  async verifyDashboardVisible() {
    await expect(this.assetTable).toBeVisible();
  }

  async clickAddAsset() {
    await this.addAssetButton.click();
  }
}
