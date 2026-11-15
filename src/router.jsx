import { useEffect, useState } from 'react'

// A tiny History API router. Paths are relative to Vite's base, so the same
// build works at any base path (the site is served from /).
const BASE = import.meta.env.BASE_URL

export const href = (path = '') => BASE + path.replace(/^\//, '')

function currentPath() {
  if (typeof window === 'undefined') return ''
  const p = window.location.pathname
  const rel = p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\//, '')
  return rel.replace(/\/$/, '')
}

export function navigate(to) {
  const [path, hash] = to.split('#')
  const url = href(path) + (hash ? `#${hash}` : '')
  window.history.replaceState({ y: window.scrollY }, '')
  window.history.pushState({}, '', url)
  window.dispatchEvent(new Event('routechange'))
}

export function useRoute(initial = '') {
  const [path, setPath] = useState(() => initial || currentPath())
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    setPath(currentPath())
    const update = () => setPath(currentPath())
    const back = () => { restoreY = window.history.state?.y ?? null; update() }
    window.addEventListener('popstate', back)
    window.addEventListener('routechange', update)
    return () => {
      window.removeEventListener('popstate', back)
      window.removeEventListener('routechange', update)
    }
  }, [])
  return path
}

// Where the back button should return to, read once by the page that renders.
let restoreY = null
export function takeRestoreY() { const y = restoreY; restoreY = null; return y }

// `to` is a site path like 'writing/x' or '#work' (home section).
export function Link({ to, children, onClick, ...rest }) {
  const isSection = to.startsWith('#')
  const url = isSection ? href('') + to : href(to)

  const handle = (e) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (isSection && currentPath() === '') {
      const el = document.getElementById(to.slice(1))
      const far = el && Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2
      el?.scrollIntoView({ behavior: far ? 'instant' : 'smooth' })
      window.history.replaceState({}, '', url)
      return
    }
    navigate(to)
  }

  return <a href={url} onClick={handle} {...rest}>{children}</a>
}
