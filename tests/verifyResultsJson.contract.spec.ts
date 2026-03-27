import { expect, test } from '@playwright/test';
import path from 'node:path';

const CASE_CODE_ANNOTATION_TYPE = 'test_lib_case_code';
const SAMPLE_SPEC_PATH = 'tests/sample.spec.ts';
const SAMPLE_START_TIME = '2026-03-27T00:00:00.000Z';

type Annotation = {
  type: string;
  description?: string;
};

type ReportCase = {
  title: string;
  annotations: Annotation[];
};

function createCaseCodeAnnotation(description?: string): Annotation {
  return {
    type: CASE_CODE_ANNOTATION_TYPE,
    description,
  };
}

function buildTestEntry(annotations: Annotation[]) {
  return {
    timeout: 30_000,
    annotations,
    expectedStatus: 'passed',
    projectId: 'chromium',
    projectName: 'chromium',
    status: 'expected',
    results: [
      {
        workerIndex: 0,
        parallelIndex: 0,
        status: 'passed',
        duration: 10,
        errors: [],
        stdout: [],
        stderr: [],
        retry: 0,
        startTime: SAMPLE_START_TIME,
        annotations,
        attachments: [],
      },
    ],
  };
}

function buildReport(testCases: ReportCase[]) {
  return {
    config: {
      rootDir: '.',
      projects: [],
    },
    suites: [
      {
        title: path.basename(SAMPLE_SPEC_PATH),
        file: SAMPLE_SPEC_PATH,
        column: 0,
        line: 0,
        specs: testCases.map((testCase, index) => ({
          title: testCase.title,
          ok: true,
          tags: [],
          id: `case-${index + 1}`,
          file: SAMPLE_SPEC_PATH,
          line: index + 1,
          column: 1,
          tests: [buildTestEntry(testCase.annotations)],
        })),
      },
    ],
    errors: [],
    stats: {
      startTime: SAMPLE_START_TIME,
      duration: 10,
      expected: testCases.length,
      skipped: 0,
      unexpected: 0,
      flaky: 0,
    },
  };
}

function buildNestedReport() {
  return {
    config: {
      rootDir: '.',
      projects: [],
    },
    suites: [
      {
        title: path.basename(SAMPLE_SPEC_PATH),
        file: SAMPLE_SPEC_PATH,
        column: 0,
        line: 0,
        specs: [
          {
            title: 'top level case',
            ok: true,
            tags: [],
            id: 'case-1',
            file: SAMPLE_SPEC_PATH,
            line: 1,
            column: 1,
            tests: [
              buildTestEntry([
                createCaseCodeAnnotation('PLAYWRIGHT_DOCS_TOP_LEVEL_CASE'),
              ]),
            ],
          },
        ],
        suites: [
          {
            title: 'nested suite',
            file: SAMPLE_SPEC_PATH,
            column: 0,
            line: 0,
            specs: [
              {
                title: 'nested case',
                ok: true,
                tags: [],
                id: 'case-2',
                file: SAMPLE_SPEC_PATH,
                line: 2,
                column: 1,
                tests: [
                  buildTestEntry([
                    createCaseCodeAnnotation('PLAYWRIGHT_DOCS_NESTED_CASE'),
                  ]),
                ],
              },
            ],
            suites: [],
          },
        ],
      },
    ],
    errors: [],
    stats: {
      startTime: SAMPLE_START_TIME,
      duration: 10,
      expected: 2,
      skipped: 0,
      unexpected: 0,
      flaky: 0,
    },
  };
}

async function loadVerifyResultsJsonReport() {
  const modulePath = path.resolve(
    process.cwd(),
    'scripts/verify-results-json.mjs',
  );
  const verifyResultsJsonModule = await import(modulePath);
  return verifyResultsJsonModule.verifyResultsJsonReport;
}

async function expectReportToPass(testCases: ReportCase[]) {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  expect(() => verifyResultsJsonReport(buildReport(testCases))).not.toThrow();
}

async function expectReportToFail(
  testCases: ReportCase[],
  expectedError: RegExp,
) {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  expect(() => verifyResultsJsonReport(buildReport(testCases))).toThrow(
    expectedError,
  );
}

test('accepts a report where every emitted test has one valid case code', async () => {
  await expectReportToPass([
    {
      title: 'has title',
      annotations: [createCaseCodeAnnotation('PLAYWRIGHT_DOCS_HAS_TITLE')],
    },
    {
      title: 'get started link',
      annotations: [createCaseCodeAnnotation('PLAYWRIGHT_DOCS_GET_STARTED_LINK')],
    },
  ]);
});

test('collects nested suites in declaration order', async () => {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();

  expect(verifyResultsJsonReport(buildNestedReport())).toEqual([
    {
      caseCode: 'PLAYWRIGHT_DOCS_TOP_LEVEL_CASE',
      caseTitle: 'top level case',
    },
    {
      caseCode: 'PLAYWRIGHT_DOCS_NESTED_CASE',
      caseTitle: 'nested case',
    },
  ]);
});

test('rejects a report with a missing case code annotation', async () => {
  await expectReportToFail(
    [
      {
        title: 'has title',
        annotations: [],
      },
    ],
    /missing test_lib_case_code/i,
  );
});

test('rejects a report with a malformed case code value', async () => {
  await expectReportToFail(
    [
      {
        title: 'has title',
        annotations: [createCaseCodeAnnotation('bad-code')],
      },
    ],
    /uppercase snake case/i,
  );
});

test('rejects a report with duplicate case code values', async () => {
  await expectReportToFail(
    [
      {
        title: 'has title',
        annotations: [createCaseCodeAnnotation('PLAYWRIGHT_DOCS_HAS_TITLE')],
      },
      {
        title: 'get started link',
        annotations: [createCaseCodeAnnotation('PLAYWRIGHT_DOCS_HAS_TITLE')],
      },
    ],
    /duplicate/i,
  );
});
