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
    },
  }),
)
