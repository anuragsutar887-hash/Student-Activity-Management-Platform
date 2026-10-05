import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const appDirectory = fileURLToPath(new URL('.', import.meta.url))
const rechartsDependencies = [
  '@reduxjs/toolkit', 'clsx', 'decimal.js-light', 'es-toolkit', 'eventemitter3', 'immer',
  'd3-array', 'd3-color', 'd3-ease', 'd3-format', 'd3-interpolate', 'd3-path', 'd3-scale',
  'd3-shape', 'd3-time', 'd3-time-format', 'd3-timer', 'internmap',
]

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: rechartsDependencies.map((dependency) => ({
      find: dependency,
      replacement: resolve(appDirectory, 'node_modules', dependency),
    })),
  },
  plugins: [react(), tailwindcss()],
})
