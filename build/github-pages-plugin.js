import { access, copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

export function githubPagesFallback() {
  let root = process.cwd()
  let outputDirectory = 'dist-pages'

  return {
    name: 'github-pages-fallback',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outputDirectory = config.build.outDir
    },
    async closeBundle() {
      const indexFile = resolve(root, outputDirectory, 'index.html')
      const fallbackFile = resolve(root, outputDirectory, '404.html')
      try {
        await access(indexFile)
      } catch {
        return
      }
      await copyFile(indexFile, fallbackFile)

      for (const route of ['admin', 'portfolio', 'services', 'contact', 'faq', 'privacy']) {
        const routeDirectory = resolve(root, outputDirectory, route)
        await mkdir(routeDirectory, { recursive: true })
        await copyFile(indexFile, resolve(routeDirectory, 'index.html'))
      }
    },
  }
}
