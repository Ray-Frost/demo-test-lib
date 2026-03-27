import { expect, test } from '@playwright/test';
import { TEST_LIB_CASE_CODES, validateTestLibCaseCodes } from './testLibCaseCodes';

test('accepts a registry with unique uppercase snake case values', () => {
  expect(() => validateTestLibCaseCodes(TEST_LIB_CASE_CODES)).not.toThrow();
  expect(Object.values(TEST_LIB_CASE_CODES).length).toBeGreaterThan(0);
});

test('rejects duplicate case code values', () => {
  expect(() =>
    validateTestLibCaseCodes({
      FIRST_CASE: 'AUTH_LOGIN_INVALID_PASSWORD',
      SECOND_CASE: 'AUTH_LOGIN_INVALID_PASSWORD',
    }),
  ).toThrow(/duplicate/i);
});

test('rejects malformed case code values', () => {
  expect(() =>
    validateTestLibCaseCodes({
      BROKEN_CASE: 'Auth Login Invalid Password',
    }),
  ).toThrow(/uppercase snake case/i);
});
