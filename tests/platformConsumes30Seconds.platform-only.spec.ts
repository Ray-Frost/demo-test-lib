import { setTimeout as sleep } from 'node:timers/promises';
import { test } from '@playwright/test';
import { caseDetails } from './caseDetails';
import { TEST_LIB_CASE_CODES } from './testLibCaseCodes';

test(
  'Platform emits an intentionally slow 30-second case',
  caseDetails(TEST_LIB_CASE_CODES.PLATFORM_CONSUMES_30_SECONDS),
  async () => {
    test.setTimeout(35_000);
    await sleep(30_000);
  },
);
