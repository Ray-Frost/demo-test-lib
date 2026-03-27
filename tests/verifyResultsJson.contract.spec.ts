import { expect, test } from '@playwright/test';
import path from 'node:path';

type Annotation = {
  type: string;
  description?: string;
};

function buildReport(testCases: Array<{ title: string; annotations: Annotation[] }>) {
  return {
    config: {
      rootDir: '.',
      projects: [],
    },
    suites: [
      {
        title: 'sample.spec.ts',
        file: 'tests/sample.spec.ts',
        column: 0,
        line: 0,
        specs: testCases.map((testCase, index) => ({
          title: testCase.title,
          ok: true,
          tags: [],
          id: `case-${index + 1}`,
          file: 'tests/sample.spec.ts',
          line: index + 1,
          column: 1,
          tests: [
            {
              timeout: 30_000,
              annotations: testCase.annotations,
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
                  startTime: '2026-03-27T00:00:00.000Z',
                  annotations: testCase.annotations,
                  attachments: [],
                },
              ],
            },
          ],
        })),
      },
    ],
    errors: [],
    stats: {
      startTime: '2026-03-27T00:00:00.000Z',
      duration: 10,
      expected: testCases.length,
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

test('accepts a report where every emitted test has one valid case code', async () => {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  const report = buildReport([
    {
      title: 'has title',
      annotations: [
        {
          type: 'test_lib_case_code',
          description: 'PLAYWRIGHT_DOCS_HAS_TITLE',
        },
      ],
    },
    {
      title: 'get started link',
      annotations: [
        {
          type: 'test_lib_case_code',
          description: 'PLAYWRIGHT_DOCS_GET_STARTED_LINK',
        },
      ],
    },
  ]);

  expect(() => verifyResultsJsonReport(report)).not.toThrow();
});

test('rejects a report with a missing case code annotation', async () => {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  const report = buildReport([
    {
      title: 'has title',
      annotations: [],
    },
  ]);

  expect(() => verifyResultsJsonReport(report)).toThrow(/missing test_lib_case_code/i);
});

test('rejects a report with a malformed case code value', async () => {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  const report = buildReport([
    {
      title: 'has title',
      annotations: [
        {
          type: 'test_lib_case_code',
          description: 'bad-code',
        },
      ],
    },
  ]);

  expect(() => verifyResultsJsonReport(report)).toThrow(/uppercase snake case/i);
});

test('rejects a report with duplicate case code values', async () => {
  const verifyResultsJsonReport = await loadVerifyResultsJsonReport();
  const report = buildReport([
    {
      title: 'has title',
      annotations: [
        {
          type: 'test_lib_case_code',
          description: 'PLAYWRIGHT_DOCS_HAS_TITLE',
        },
      ],
    },
    {
      title: 'get started link',
      annotations: [
        {
          type: 'test_lib_case_code',
          description: 'PLAYWRIGHT_DOCS_HAS_TITLE',
        },
      ],
    },
  ]);

  expect(() => verifyResultsJsonReport(report)).toThrow(/duplicate/i);
});
