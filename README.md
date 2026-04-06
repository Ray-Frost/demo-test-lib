# demo-test-lib

`demo-test-lib` is a small Playwright-based reference project for testing a system under test (SUT). It includes browser-facing example specs, a local smoke flow, contract tests, and a Playwright config that can emit machine-readable artifacts.

## What it includes

- [`tests/example.spec.ts`](tests/example.spec.ts): sample browser tests against `playwright.dev`
- [`tests/smoke.spec.ts`](tests/smoke.spec.ts): local smoke flow using page objects
- [`tests/caseDetails.ts`](tests/caseDetails.ts) and [`tests/testLibCaseCodes.ts`](tests/testLibCaseCodes.ts): optional case code reporting helpers used by the current suite
- [`playwright.platform.config.ts`](playwright.platform.config.ts): Playwright config that emits HTML and JSON artifacts
- [`scripts/verify-results-json.mjs`](scripts/verify-results-json.mjs): CLI validator for generated `results.json`
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

## Case code reporting

The current suite uses `test_lib_case_code` annotations for machine-readable reporting. If a test participates in that flow:

1. Add a new entry to [`tests/testLibCaseCodes.ts`](tests/testLibCaseCodes.ts).
2. Attach it to the test with `caseDetails(...)`.
3. Run `npm run verify:case-codes`.
4. If you generated JSON artifacts, run `npm run verify:results-json`.

The repository verifies that case codes are uppercase snake case, globally unique, and present in generated `results.json` output for tests that participate in case code reporting.

## Artifact paths

[`playwright.platform.config.ts`](playwright.platform.config.ts) writes artifacts to repository-local paths by default:

- `results.json`
- `playwright-report/`
- `test-results/`

You can override those paths with:

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

## Notes

- [`tests/smoke.spec.ts`](tests/smoke.spec.ts) expects a local app at `http://localhost:3000` with matching `data-testid` selectors.
- Contract specs (`*.contract.spec.ts`) validate helper behavior and supporting test infrastructure rather than end-user flows.
