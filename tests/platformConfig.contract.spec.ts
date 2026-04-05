import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createPlatformConfig } from '../playwright.platform.config';

type ReporterOptions = Record<string, unknown>;

function findReporterOptions(
  platformConfig: ReturnType<typeof createPlatformConfig>,
  reporterName: string,
): ReporterOptions {
  if (!Array.isArray(platformConfig.reporter)) {
    throw new Error('Platform config reporter must be an array.');
  }

  const reporterEntry = platformConfig.reporter.find(
    (entry) => Array.isArray(entry) && entry[0] === reporterName,
  );

  if (!Array.isArray(reporterEntry)) {
    throw new Error(`Could not find the ${reporterName} reporter.`);
  }

  return (reporterEntry[1] as ReporterOptions | undefined) ?? {};
}

test('platform config defaults artifact outputs to repo-local paths', () => {
  const platformConfig = createPlatformConfig({});
  const htmlReporterOptions = findReporterOptions(platformConfig, 'html');
  const jsonReporterOptions = findReporterOptions(platformConfig, 'json');

  expect(platformConfig.outputDir).toBe(
    path.resolve(process.cwd(), 'test-results'),
  );
  expect(htmlReporterOptions.outputFolder).toBe(
    path.resolve(process.cwd(), 'playwright-report'),
  );
  expect(jsonReporterOptions.outputFile).toBe(
    path.resolve(process.cwd(), 'results.json'),
  );
});

test('platform config uses orchestrator artifact paths when provided', () => {
  const platformConfig = createPlatformConfig({
    E2E_RESULTS_JSON_PATH: '/tmp/orchestrator-results/results.json',
    E2E_PLAYWRIGHT_REPORT_DIR: '/tmp/orchestrator-results/report',
    E2E_TEST_RESULTS_DIR: '/tmp/orchestrator-results/test-results',
  });
  const htmlReporterOptions = findReporterOptions(platformConfig, 'html');
  const jsonReporterOptions = findReporterOptions(platformConfig, 'json');

  expect(platformConfig.outputDir).toBe(
    '/tmp/orchestrator-results/test-results',
  );
  expect(htmlReporterOptions.outputFolder).toBe(
    '/tmp/orchestrator-results/report',
  );
  expect(jsonReporterOptions.outputFile).toBe(
    '/tmp/orchestrator-results/results.json',
  );
});
