import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sites } from './build/sites-vite-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sites(), cloudflare({ viteEnvironment: { name: 'server' } })],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
