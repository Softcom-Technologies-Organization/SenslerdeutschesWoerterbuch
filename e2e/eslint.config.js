// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  {
    ignores: ['container-artifacts/**', 'test-results/**', 'playwright-report/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      // Keep last: turns off any ESLint rules that conflict with Prettier.
      prettier,
    ],
  },
);
