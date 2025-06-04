import { defineConfig } from 'vitest/config'

export default defineConfig({
  projects: [
    './apps/backend',
    './apps/web',
    './packages/markdown',
  ],
})
