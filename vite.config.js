import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { githubPagesFallback } from './build/github-pages-plugin.js'
import { sites } from './build/sites-vite-plugin.js'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const isGitHubPages = mode === 'github-pages'
  const plugins = [react()]

  if (isGitHubPages) {
    plugins.push(githubPagesFallback())
  } else {
    const { cloudflare } = await import('@cloudflare/vite-plugin')
    plugins.push(sites(), cloudflare({ viteEnvironment: { name: 'server' } }))
  }

  return {
    base: '/',
    plugins,
    server: {
      port: 3000,
      strictPort: true,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      ...(isGitHubPages ? { outDir: 'dist-pages' } : {}),
    },
  }
})
