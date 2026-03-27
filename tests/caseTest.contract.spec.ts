import { expect, test } from '@playwright/test';
import { CASE_CODE_ANNOTATION_TYPE, createCaseTestDetails } from './caseTest';

test('creates Playwright test details with the case code annotation', () => {
  expect(createCaseTestDetails('AUTH_LOGIN_INVALID_PASSWORD')).toEqual({
    annotation: {
      type: CASE_CODE_ANNOTATION_TYPE,
      description: 'AUTH_LOGIN_INVALID_PASSWORD',
    },
  });
});
