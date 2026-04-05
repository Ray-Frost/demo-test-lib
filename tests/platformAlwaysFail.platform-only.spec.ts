import { expect, test } from '@playwright/test';
import { caseDetails } from './caseDetails';
import { TEST_LIB_CASE_CODES } from './testLibCaseCodes';

test(
  'Platform emits an intentionally failing case',
  caseDetails(TEST_LIB_CASE_CODES.PLATFORM_ALWAYS_FAIL),
  async () => {
    expect(
      'INTENTIONAL_PLATFORM_FAILURE',
      'This platform-only test is expected to fail every time.',
    ).toBe('EXPECTED_SUCCESS');
  },
);
