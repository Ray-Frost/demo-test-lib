import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CASE_CODE_ANNOTATION_TYPE = 'test_lib_case_code';
const TEST_LIB_CASE_CODE_PATTERN = /^[A-Z0-9_]+$/;

function collectSpecs(suites, collectedSpecs = []) {
  for (const suite of suites ?? []) {
    collectedSpecs.push(...(suite.specs ?? []));
    collectSpecs(suite.suites, collectedSpecs);
  }

  return collectedSpecs;
}

function filterCaseCodeAnnotations(annotations) {
  return annotations.filter(
    (annotation) => annotation?.type === CASE_CODE_ANNOTATION_TYPE,
  );
}

function findCaseCodeAnnotations(testEntry) {
  const testAnnotations = Array.isArray(testEntry.annotations)
    ? testEntry.annotations
    : [];

  if (testAnnotations.length > 0) {
    return filterCaseCodeAnnotations(testAnnotations);
  }

  const resultAnnotations = [];
  for (const result of testEntry.results ?? []) {
    if (Array.isArray(result.annotations)) {
      resultAnnotations.push(...result.annotations);
    }
  }

  return filterCaseCodeAnnotations(resultAnnotations);
}

function validateCaseCode(caseCode, caseTitle) {
  if (!caseCode || caseCode.trim().length === 0) {
    throw new Error(
      `Test "${caseTitle}" has an empty test_lib_case_code annotation.`,
    );
  }

  if (!TEST_LIB_CASE_CODE_PATTERN.test(caseCode)) {
    throw new Error(
      `test_lib_case_code "${caseCode}" for test "${caseTitle}" must use uppercase snake case.`,
    );
  }
}

function getCaseCodeFromTest(testEntry, caseTitle) {
  const caseCodeAnnotations = findCaseCodeAnnotations(testEntry);

  if (caseCodeAnnotations.length === 0) {
    throw new Error(`Test "${caseTitle}" is missing test_lib_case_code annotation.`);
  }

  if (caseCodeAnnotations.length > 1) {
    throw new Error(`Test "${caseTitle}" has multiple test_lib_case_code annotations.`);
  }

  const caseCode = caseCodeAnnotations[0].description?.trim();
  validateCaseCode(caseCode, caseTitle);
  return caseCode;
}

export function verifyResultsJsonReport(report) {
  const seenCaseCodes = new Set();
  const collectedCases = [];
  const specs = collectSpecs(report.suites ?? []);

  for (const spec of specs) {
    for (const testEntry of spec.tests ?? []) {
      const caseCode = getCaseCodeFromTest(testEntry, spec.title);

      if (seenCaseCodes.has(caseCode)) {
        throw new Error(
          `Duplicate test_lib_case_code "${caseCode}" found in results.json.`,
        );
      }

      seenCaseCodes.add(caseCode);
      collectedCases.push({
        caseCode,
        caseTitle: spec.title,
      });
    }
  }

  return collectedCases;
}

export function verifyResultsJsonFile(resultsJsonPath) {
  const report = JSON.parse(readFileSync(resultsJsonPath, 'utf8'));
  return verifyResultsJsonReport(report);
}

function runCli() {
  const resultsJsonPath =
    process.argv[2] ?? path.resolve(process.cwd(), 'results.json');
  const collectedCases = verifyResultsJsonFile(resultsJsonPath);

  console.log(
    `Verified ${collectedCases.length} test_lib_case_code entries in ${resultsJsonPath}.`,
  );
}

const currentFilePath = fileURLToPath(import.meta.url);
const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === currentFilePath;

if (isDirectExecution) {
  try {
    runCli();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Unknown results.json verification error.',
    );
    process.exitCode = 1;
  }
}
