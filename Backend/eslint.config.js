// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    }
  },
];
