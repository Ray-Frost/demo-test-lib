import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

function readArtifactOutputPath(
  environment: NodeJS.ProcessEnv,
  key:
    | 'E2E_RESULTS_JSON_PATH'
    | 'E2E_PLAYWRIGHT_REPORT_DIR'
    | 'E2E_TEST_RESULTS_DIR',
  fallbackPath: string,
) {
  const rawValue = environment[key];

  if (rawValue === undefined) {
    return fallbackPath;
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue.length === 0) {
    return fallbackPath;
  }

  return trimmedValue;
}

export function createPlatformConfig(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const resultsJsonPath = readArtifactOutputPath(
    environment,
    'E2E_RESULTS_JSON_PATH',
    path.resolve(__dirname, 'results.json'),
  );
  const playwrightReportDir = readArtifactOutputPath(
    environment,
    'E2E_PLAYWRIGHT_REPORT_DIR',
    path.resolve(__dirname, 'playwright-report'),
  );
  const testResultsDir = readArtifactOutputPath(
    environment,
    'E2E_TEST_RESULTS_DIR',
    path.resolve(__dirname, 'test-results'),
  );

  return defineConfig({
    ...baseConfig,
    outputDir: testResultsDir,
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    reporter: [
      [
        'html',
        {
          outputFolder: playwrightReportDir,
        },
      ],
      [
        'json',
        {
          outputFile: resultsJsonPath,
        },
      ],
    ],
  });
}

export default createPlatformConfig();
