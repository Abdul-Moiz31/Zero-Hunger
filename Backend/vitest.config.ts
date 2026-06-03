import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    // In-memory Mongo download + boot can be slow on first run.
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
