import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { fileURLToPath } from 'node:url'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      exclude: ['**/node_modules/**', 'tests/e2e/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      },
    },
  }),
)
