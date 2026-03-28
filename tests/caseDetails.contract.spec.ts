import { expect, test } from '@playwright/test';
import { CASE_CODE_ANNOTATION_TYPE, caseDetails } from './caseDetails';

test('creates Playwright test details with the case code annotation', () => {
  expect(caseDetails('AUTH_LOGIN_INVALID_PASSWORD')).toEqual({
    annotation: {
      type: CASE_CODE_ANNOTATION_TYPE,
      description: 'AUTH_LOGIN_INVALID_PASSWORD',
    },
  });
});
