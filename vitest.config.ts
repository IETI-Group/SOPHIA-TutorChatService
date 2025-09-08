import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/**', 'dist/**', 'docs/**', 'tests/**', 'coverage/**'],
      reportsDirectory: './coverage',
    },
    testTimeout: 10000,
  },
});
