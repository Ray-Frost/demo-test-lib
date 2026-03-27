import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.contract\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: true,
  outputDir: '/tmp/demo-test-lib-verify-results',
  reporter: 'line',
  retries: 0,
  workers: 1,
});
