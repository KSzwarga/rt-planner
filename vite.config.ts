/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Unit tests only. Playwright specs in e2e/ run with `npm run test:e2e`.
    include: ['test/**/*.test.{ts,tsx}'],
  },
})
