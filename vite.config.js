import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ESSAYS } from './src/content/essays.js'

// The site lives at the root of faizazizatk.github.io (and of Vercel).
const base = process.env.BASE_PATH || '/'

// Absolute site URL for canonical links and preview images.
const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://faizazizatk.github.io')
).replace(/\/$/, '')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Writes dist/writing/<slug>/index.html with that essay's title, description
// and preview image, so shared links unfurl properly without running JS.
// Also copies index.html to 404.html for GitHub Pages' SPA fallback.
function staticPages() {
  let outDir
  return {
    name: 'static-pages',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', SITE_URL)
    },
    closeBundle() {
      const index = path.join(outDir, 'index.html')
      if (!fs.existsSync(index) || process.argv.includes('--ssr')) return
      const html = fs.readFileSync(index, 'utf8')
      const set = (page, re, value) => page.replace(re, (_, head) => head + esc(value))

      for (const e of ESSAYS) {
        const url = `${SITE_URL}/writing/${e.slug}/`
        const title = `${e.title}, by Faiz Aziz`
        let page = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
        page = set(page, /(<meta name="description" content=")[^"]*/, e.dek)
        page = set(page, /(<meta property="og:title" content=")[^"]*/, title)
        page = set(page, /(<meta property="og:description" content=")[^"]*/, e.dek)
        page = set(page, /(<meta property="og:url" content=")[^"]*/, url)
        page = set(page, /(<meta property="og:image" content=")[^"]*/, `${SITE_URL}/og/${e.slug}.jpg`)
        page = set(page, /(<link rel="canonical" href=")[^"]*/, url)
        page = page.replace('content="website"', 'content="article"')
        page = page.replace('<div id="root"></div>', `<div id="root" data-path="writing/${e.slug}"></div>`)
        const dir = path.join(outDir, 'writing', e.slug)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), page)
      }
      fs.copyFileSync(index, path.join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [react(), staticPages()],
  base,
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
