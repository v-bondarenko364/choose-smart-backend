import { fileURLToPath } from 'url';
import { dirname } from 'path';
import js from '@eslint/js';
import tseslintParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import checkFilePlugin from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: ['.eslintrc.js', 'dist/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      unicorn: unicornPlugin,
      'check-file': checkFilePlugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // common rules
      'no-debugger': 'off',
      'no-console': 'warn',
      'prettier/prettier': 'error',
      eqeqeq: 'error',
      // ts
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': 'off',
      // unicorn
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-object-from-entries': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/no-negated-condition': 'off',
      // file-naming
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'CAMEL_CASE',
        },
      ],
      // other
      'class-methods-use-this': 'off',
      'import/no-cycle': 'off',
    },
  },
  prettierConfig,
];
