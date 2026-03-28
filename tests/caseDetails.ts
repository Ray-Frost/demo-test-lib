import { type TestDetails } from '@playwright/test';
import { type TestLibCaseCode } from './testLibCaseCodes';

export const CASE_CODE_ANNOTATION_TYPE = 'test_lib_case_code';

type CaseCodeValue = TestLibCaseCode | string;
export function caseDetails(caseCode: CaseCodeValue): TestDetails {
  return {
    annotation: {
      type: CASE_CODE_ANNOTATION_TYPE,
      description: caseCode,
    },
  };
}
