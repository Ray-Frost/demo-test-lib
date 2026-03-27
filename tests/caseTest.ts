import { test, type TestDetails } from '@playwright/test';
import { type TestLibCaseCode } from './testLibCaseCodes';

export const CASE_CODE_ANNOTATION_TYPE = 'test_lib_case_code';

type CaseCodeValue = TestLibCaseCode | string;
type CaseTestBody = Parameters<typeof test>[2];

type CaseTestDefinition = {
  caseCode: CaseCodeValue;
  title: string;
};

export function createCaseTestDetails(caseCode: CaseCodeValue): TestDetails {
  return {
    annotation: {
      type: CASE_CODE_ANNOTATION_TYPE,
      description: caseCode,
    },
  };
}

export function caseTest(
  { caseCode, title }: CaseTestDefinition,
  body: CaseTestBody,
) {
  test(title, createCaseTestDetails(caseCode), body);
}
