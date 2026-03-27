import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

function listExampleSpecTests() {
  const playwrightCliPath = path.resolve(
    process.cwd(),
    'node_modules/playwright/cli.js',
  );

  return execFileSync(
    process.execPath,
    [playwrightCliPath, 'test', '--list', 'tests/example.spec.ts'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  );
}

test('lists wrapped tests at the example spec location instead of the helper file', () => {
  const output = listExampleSpecTests();

  expect(output).toContain('example.spec.ts:');
  expect(output).not.toMatch(/\bcase(?:Test|Details)\.ts:/);
});
