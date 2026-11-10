import { svelte } from '@sveltejs/vite-plugin-svelte'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { parspackChat } from './chat-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [svelte(), react(), parspackChat()],
  server: {
    fs: {
      allow: [
        "/home/piker/Projects/other/mine/presentation/abrha-2026-11/api-test-webapp",
        "/home/piker/Projects/other/mine/test/ai-request-proxy",
      ],
    },
  },
})
