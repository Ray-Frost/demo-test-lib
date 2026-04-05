import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PLATFORM_CONFIG_PATH = 'playwright.platform.config.ts';
const CASE_DETAILS_REGEX =
  /caseDetails\s*\(\s*TEST_LIB_CASE_CODES\.([A-Z0-9_]+)\s*\)/g;
const SPEC_FILE_REGEX = /.*\.spec\.ts$/;
const CONTRACT_SPEC_FILE_REGEX = /.*\.contract\.spec\.ts$/;

type RepoCaseSpec = {
  caseCodes: string[];
  specPath: string;
};

export function listPlatformSpecTests(specPath: string) {
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

export function getListedTestCount(listOutput: string, specPath: string) {
  const match = listOutput.match(/Total:\s+(\d+)\s+tests?\s+in\s+\d+\s+file/);

  if (!match) {
    throw new Error(
      `Could not determine listed Playwright test count for ${specPath}.`,
    );
  }

  return Number(match[1]);
}

export function extractCaseCodes(sourceText: string) {
  return Array.from(
    sourceText.matchAll(CASE_DETAILS_REGEX),
    ([, caseCode]) => caseCode,
  );
}

export function findDuplicateCaseCode(caseCodes: string[]) {
  const seenCaseCodes = new Set<string>();

  for (const caseCode of caseCodes) {
    if (seenCaseCodes.has(caseCode)) {
      return caseCode;
    }

    seenCaseCodes.add(caseCode);
  }

  return undefined;
}

function walkDirectoryPaths(directoryPath: string, collectedPaths: string[] = []) {
  for (const directoryEntry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      walkDirectoryPaths(entryPath, collectedPaths);
      continue;
    }

    collectedPaths.push(entryPath);
  }

  return collectedPaths;
}

export function listRepoCaseSpecPaths(testsDirectoryPath = path.resolve(process.cwd(), 'tests')) {
  return walkDirectoryPaths(testsDirectoryPath)
    .map((absolutePath) => path.relative(process.cwd(), absolutePath))
    .filter((relativePath) => SPEC_FILE_REGEX.test(relativePath))
    .filter((relativePath) => !CONTRACT_SPEC_FILE_REGEX.test(relativePath))
    .filter((relativePath) =>
      extractCaseCodes(readFileSync(path.resolve(process.cwd(), relativePath), 'utf8'))
        .length > 0,
    )
    .sort();
}

export function validatePlatformSpecCaseDetails(
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

export function readRepoCaseSpec(specPath: string): RepoCaseSpec {
  const resolvedSpecPath = path.resolve(process.cwd(), specPath);
  const listOutput = listPlatformSpecTests(specPath);
  const listedTestCount = getListedTestCount(listOutput, specPath);
  const sourceText = readFileSync(resolvedSpecPath, 'utf8');
  const caseCodes = extractCaseCodes(sourceText);

  validatePlatformSpecCaseDetails(specPath, listedTestCount, caseCodes);

  return {
    caseCodes,
    specPath,
  };
}

export function findDuplicateCaseCodeAcrossSpecs(repoCaseSpecs: RepoCaseSpec[]) {
  const seenCaseCodes = new Map<string, string>();

  for (const repoCaseSpec of repoCaseSpecs) {
    for (const caseCode of repoCaseSpec.caseCodes) {
      const previousSpecPath = seenCaseCodes.get(caseCode);

      if (previousSpecPath) {
        return {
          caseCode,
          previousSpecPath,
          specPath: repoCaseSpec.specPath,
        };
      }

      seenCaseCodes.set(caseCode, repoCaseSpec.specPath);
    }
  }

  return undefined;
}

export function assertRepoCaseSpecsHaveUniqueCaseDetails() {
  const repoCaseSpecs = listRepoCaseSpecPaths().map(readRepoCaseSpec);
  const duplicateCaseCode = findDuplicateCaseCodeAcrossSpecs(repoCaseSpecs);

  if (duplicateCaseCode) {
    throw new Error(
      `test_lib_case_code "${duplicateCaseCode.caseCode}" is reused in "${duplicateCaseCode.previousSpecPath}" and "${duplicateCaseCode.specPath}".`,
    );
  }
}
