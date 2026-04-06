# demo-test-lib

`demo-test-lib` is a small Playwright-based reference project for attaching stable `test_lib_case_code` annotations to test cases and verifying that those codes remain valid, unique, and available in generated test results.

It demonstrates a simple pattern:

1. Define case codes in one registry.
2. Attach a case code to each Playwright test with `caseDetails(...)`.
3. Validate repository rules with contract tests.
4. Verify that `results.json` still contains one valid case code per emitted test.

## Why this repo exists

Many test orchestrators need a stable identifier that survives title changes and can be read from machine-generated artifacts. This repo shows one lightweight way to do that in Playwright without adding a large abstraction layer.

The repo covers:

- a shared case code registry
- a helper for adding case code annotations to Playwright tests
- contract tests that enforce repository rules
- a platform-oriented Playwright config that emits `results.json`
- a CLI script that validates `results.json`

## Core idea

Case codes are stored in [`tests/testLibCaseCodes.ts`](tests/testLibCaseCodes.ts) and attached to tests with [`tests/caseDetails.ts`](tests/caseDetails.ts).

```ts
test(
  'User logs in successfully and clicks Add Asset',
  caseDetails(TEST_LIB_CASE_CODES.AUTH_LOGIN_SUCCESS_ADD_ASSET),
  async ({ page }) => {
    // test body
  },
);
```

That helper adds a Playwright annotation with type `test_lib_case_code`. The repository then verifies that:

- every case code is uppercase snake case
- every case code is unique
- every relevant spec declares one `caseDetails(...)` per test
- generated `results.json` output contains exactly one valid case code per emitted test

## Project structure

- [`tests/testLibCaseCodes.ts`](tests/testLibCaseCodes.ts): canonical case code registry and validation
- [`tests/caseDetails.ts`](tests/caseDetails.ts): helper that creates Playwright test details with the annotation
- [`tests/example.spec.ts`](tests/example.spec.ts): public-site sample tests against `playwright.dev`
- [`tests/smoke.spec.ts`](tests/smoke.spec.ts): local app smoke test using page objects
- [`playwright.platform.config.ts`](playwright.platform.config.ts): single-browser config that emits HTML and JSON artifacts
- [`scripts/verify-results-json.mjs`](scripts/verify-results-json.mjs): CLI validator for exported Playwright JSON results
- [`.github/workflows/verify-case-codes.yml`](.github/workflows/verify-case-codes.yml): pull request check for contract verification

## Requirements

- Node.js 22 or later
- npm
- Playwright browser binaries installed locally

Install dependencies with:

```bash
npm ci
```

If Playwright browsers are not installed yet, run:

```bash
npx playwright install
```

## Commands

```bash
# Run the default Playwright test suite
npm test

# Open Playwright UI mode
npm run test:ui

# Run the local app smoke test
npm run test:smoke

# Run the platform-oriented smoke suite and emit results.json
npm run test:smoke:platform

# Verify contract rules for case codes and platform specs
npm run verify:case-codes

# Verify a generated results.json file
npm run verify:results-json
```

## Platform artifact output

[`playwright.platform.config.ts`](playwright.platform.config.ts) writes artifacts to repository-local paths by default:

- `results.json`
- `playwright-report/`
- `test-results/`

For orchestrated environments, you can override those paths with:

- `E2E_RESULTS_JSON_PATH`
- `E2E_PLAYWRIGHT_REPORT_DIR`
- `E2E_TEST_RESULTS_DIR`

Example:

```bash
E2E_RESULTS_JSON_PATH=/tmp/results.json \
E2E_PLAYWRIGHT_REPORT_DIR=/tmp/playwright-report \
E2E_TEST_RESULTS_DIR=/tmp/test-results \
npm run test:smoke:platform
```

## Validation workflow

Use this flow when adding or changing tests:

1. Add a new entry to [`tests/testLibCaseCodes.ts`](tests/testLibCaseCodes.ts).
2. Attach that code to the test with `caseDetails(...)`.
3. Run `npm run verify:case-codes`.
4. If you generated JSON artifacts, run `npm run verify:results-json`.

## Notes

- [`tests/example.spec.ts`](tests/example.spec.ts) runs against `https://playwright.dev/`.
- [`tests/smoke.spec.ts`](tests/smoke.spec.ts) expects a local app at `http://localhost:3000` with matching `data-testid` selectors.
- Contract specs (`*.contract.spec.ts`) validate library behavior and repository rules rather than end-user flows.
