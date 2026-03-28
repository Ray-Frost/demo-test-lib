import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SMOKE_SPEC_PATH = 'tests/smoke.spec.ts';
const PLATFORM_CONFIG_PATH = 'playwright.platform.config.ts';
const CASE_DETAILS_REGEX =
  /caseDetails\s*\(\s*TEST_LIB_CASE_CODES\.([A-Z0-9_]+)\s*\)/g;

function listSpecTests(specPath: string) {
  const playwrightCliPath = path.resolve(
    process.cwd(),
    'node_modules/playwright/cli.js',
  );

  return execFileSync(
    process.execPath,
    [
      playwrightCliPath,
      'test',
      '--config',
      PLATFORM_CONFIG_PATH,
      '--list',
      specPath,
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );
}

function getListedTestCount(listOutput: string, specPath: string) {
  const match = listOutput.match(/Total:\s+(\d+)\s+tests?\s+in\s+\d+\s+file/);

  if (!match) {
    throw new Error(`Could not determine listed Playwright test count for ${specPath}.`);
  }

  return Number(match[1]);
}

function extractCaseCodes(sourceText: string) {
  return Array.from(
    sourceText.matchAll(CASE_DETAILS_REGEX),
    ([, caseCode]) => caseCode,
  );
}

function findDuplicateCaseCode(caseCodes: string[]) {
  const seenCaseCodes = new Set<string>();

  for (const caseCode of caseCodes) {
    if (seenCaseCodes.has(caseCode)) {
      return caseCode;
    }

    seenCaseCodes.add(caseCode);
  }

  return undefined;
}

function validatePlatformSmokeSpec(
  specPath: string,
  listedTestCount: number,
  caseCodes: string[],
) {
  if (caseCodes.length !== listedTestCount) {
    throw new Error(
      `${specPath} defines ${listedTestCount} Playwright tests but only ${caseCodes.length} caseDetails(...) usages.`,
    );
  }

  const duplicateCaseCode = findDuplicateCaseCode(caseCodes);
  if (duplicateCaseCode) {
    throw new Error(
      `${specPath} reuses test_lib_case_code "${duplicateCaseCode}".`,
    );
  }
}

test('smoke spec has one unique caseDetails call per listed Playwright test', () => {
  const smokeSpecPath = path.resolve(process.cwd(), SMOKE_SPEC_PATH);
  const listOutput = listSpecTests(SMOKE_SPEC_PATH);
  const listedTestCount = getListedTestCount(listOutput, SMOKE_SPEC_PATH);
  const sourceText = readFileSync(smokeSpecPath, 'utf8');
  const caseCodes = extractCaseCodes(sourceText);

  validatePlatformSmokeSpec(SMOKE_SPEC_PATH, listedTestCount, caseCodes);
});

test('rejects a smoke spec when listed tests exceed caseDetails usages', () => {
  const sourceText = `
    import { test } from '@playwright/test';

    test('smoke test', async () => {});
  `;
  const caseCodes = extractCaseCodes(sourceText);

  expect(() => validatePlatformSmokeSpec(SMOKE_SPEC_PATH, 1, caseCodes)).toThrow(
    /only 0 caseDetails\(\.\.\.\) usages/i,
  );
});

test('rejects a smoke spec when it reuses a case code', () => {
  const sourceText = `
    test(
      'first smoke test',
      caseDetails(TEST_LIB_CASE_CODES.AUTH_LOGIN_SUCCESS_ADD_ASSET),
      async () => {},
    );

    test(
      'second smoke test',
      caseDetails(TEST_LIB_CASE_CODES.AUTH_LOGIN_SUCCESS_ADD_ASSET),
      async () => {},
    );
  `;
  const caseCodes = extractCaseCodes(sourceText);

  expect(() => validatePlatformSmokeSpec(SMOKE_SPEC_PATH, 2, caseCodes)).toThrow(
    /reuses test_lib_case_code "AUTH_LOGIN_SUCCESS_ADD_ASSET"/i,
  );
});
