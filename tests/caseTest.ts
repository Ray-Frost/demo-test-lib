import { test, type TestDetails } from '@playwright/test';
import { type TestLibCaseCode } from './testLibCaseCodes';

export const CASE_CODE_ANNOTATION_TYPE = 'test_lib_case_code';

type CaseTestBody = Parameters<typeof test>[2];

type CaseTestDefinition = {
  caseCode: TestLibCaseCode | string;
  title: string;
};

export function createCaseTestDetails(caseCode: TestLibCaseCode | string): TestDetails {
  return {
    annotation: {
      type: CASE_CODE_ANNOTATION_TYPE,
      description: caseCode,
    },
  };
}

export function caseTest(caseDefinition: CaseTestDefinition, body: CaseTestBody) {
  test(
    caseDefinition.title,
    createCaseTestDetails(caseDefinition.caseCode),
    body,
  );
}
