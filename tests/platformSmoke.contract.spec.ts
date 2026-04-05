import { expect, test } from '@playwright/test';
import {
  assertRepoCaseSpecsHaveUniqueCaseDetails,
  extractCaseCodes,
  findDuplicateCaseCodeAcrossSpecs,
  listRepoCaseSpecPaths,
  validatePlatformSpecCaseDetails,
} from './platformSpecContract';

const SMOKE_SPEC_PATH = 'tests/smoke.spec.ts';

test(
  'repo case specs each declare exactly one caseDetails per test and stay globally unique',
  () => {
    expect(listRepoCaseSpecPaths()).toEqual(
      expect.arrayContaining([
        'tests/example.spec.ts',
        'tests/platformAlwaysFail.platform-only.spec.ts',
        'tests/platformConsumes30Seconds.platform-only.spec.ts',
        'tests/smoke.spec.ts',
      ]),
    );
    assertRepoCaseSpecsHaveUniqueCaseDetails();
  },
);

test('rejects a spec when listed tests exceed caseDetails usages', () => {
  const sourceText = `
    import { test } from '@playwright/test';

    test('smoke test', async () => {});
  `;
  const caseCodes = extractCaseCodes(sourceText);

  expect(() =>
    validatePlatformSpecCaseDetails(SMOKE_SPEC_PATH, 1, caseCodes),
  ).toThrow(/only 0 caseDetails\(\.\.\.\) usages/i);
});

test('rejects a spec when it reuses a case code', () => {
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

  expect(() =>
    validatePlatformSpecCaseDetails(SMOKE_SPEC_PATH, 2, caseCodes),
  ).toThrow(/reuses test_lib_case_code "AUTH_LOGIN_SUCCESS_ADD_ASSET"/i);
});

test('rejects a case code that is reused across repo case specs', () => {
  expect(
    findDuplicateCaseCodeAcrossSpecs([
      {
        specPath: 'tests/example.spec.ts',
        caseCodes: ['PLAYWRIGHT_DOCS_HAS_TITLE'],
      },
      {
        specPath: 'tests/smoke.spec.ts',
        caseCodes: ['PLAYWRIGHT_DOCS_HAS_TITLE'],
      },
    ]),
  ).toEqual({
    caseCode: 'PLAYWRIGHT_DOCS_HAS_TITLE',
    previousSpecPath: 'tests/example.spec.ts',
    specPath: 'tests/smoke.spec.ts',
  });
});
