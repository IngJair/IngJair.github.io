import { copyFile } from 'node:fs/promises'
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
      await copyFile(indexFile, fallbackFile)
    },
  }
}
