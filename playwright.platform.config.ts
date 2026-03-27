import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: [
    ['html'],
    [
      'json',
      {
        outputFile: path.resolve(__dirname, 'results.json'),
      },
    ],
  ],
});
