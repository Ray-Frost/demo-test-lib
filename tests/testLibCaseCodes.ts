const TEST_LIB_CASE_CODE_PATTERN = /^[A-Z0-9_]+$/;

export const TEST_LIB_CASE_CODES = {
  PLAYWRIGHT_DOCS_HAS_TITLE: 'PLAYWRIGHT_DOCS_HAS_TITLE',
  PLAYWRIGHT_DOCS_GET_STARTED_LINK: 'PLAYWRIGHT_DOCS_GET_STARTED_LINK',
  AUTH_LOGIN_SUCCESS_ADD_ASSET: 'AUTH_LOGIN_SUCCESS_ADD_ASSET',
  PLATFORM_ALWAYS_FAIL: 'PLATFORM_ALWAYS_FAIL',
} as const;

export type TestLibCaseCode =
  (typeof TEST_LIB_CASE_CODES)[keyof typeof TEST_LIB_CASE_CODES];

export function validateTestLibCaseCodes(
  caseCodeRegistry: Record<string, string>,
): void {
  const seenCodes = new Map<string, string>();

  for (const [registryKey, caseCode] of Object.entries(caseCodeRegistry)) {
    if (caseCode.trim().length === 0) {
      throw new Error(
        `test_lib_case_code "${registryKey}" must be a non-empty string.`,
      );
    }

    if (!TEST_LIB_CASE_CODE_PATTERN.test(caseCode)) {
      throw new Error(
        `test_lib_case_code "${caseCode}" must use uppercase snake case.`,
      );
    }

    const previousRegistryKey = seenCodes.get(caseCode);
    if (previousRegistryKey) {
      throw new Error(
        `Duplicate test_lib_case_code "${caseCode}" found in "${previousRegistryKey}" and "${registryKey}".`,
      );
    }

    seenCodes.set(caseCode, registryKey);
  }
}

validateTestLibCaseCodes(TEST_LIB_CASE_CODES);
