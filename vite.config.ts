import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 关闭 HMR 错误覆盖层,让单点 SCSS/SFC 错误不再遮住整页
  // (报错仍会出现在 dev server 控制台与浏览器 console)
  server: {
    hmr: { overlay: false },
  },
})
