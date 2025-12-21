import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'plugins/**/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts', 'plugins/*/src/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@3dviewer/plugin-sdk': resolve(__dirname, 'packages/plugin-sdk/src'),
      '@3dviewer/plugin-sdk/testing': resolve(__dirname, 'packages/plugin-sdk/src/testing'),
    },
  },
});
