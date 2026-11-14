// After the client and server builds, write each page's real content into its HTML.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = path.resolve('dist')
const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href)
const { ESSAYS } = await import(pathToFileURL(path.resolve('src/content/essays.js')).href)

const pages = [['', 'index.html'], ...ESSAYS.map((e) => [`writing/${e.slug}`, `writing/${e.slug}/index.html`])]
for (const [route, file] of pages) {
  const target = path.join(dist, file)
  const html = fs.readFileSync(target, 'utf8')
  const open = html.match(/<div id="root"[^>]*>/)[0]
  fs.writeFileSync(target, html.replace(`${open}</div>`, `${open}${render(route)}</div>`))
}
fs.rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerendered', pages.length, 'pages')
