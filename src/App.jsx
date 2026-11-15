import { useEffect, useLayoutEffect } from 'react'
import { useRoute, Link, takeRestoreY } from './router'
import { essayBySlug } from './content/essays'
import { person } from './content/site'
import Home from './components/Home'
import Essay from './components/Essay'
import Nav from './components/Nav'

const HOME_TITLE = `${person.name}, AI agents for places where being wrong is expensive`

function NotFound() {
  return (
    <section className="notfound">
      <h1>Nothing here.</h1>
      <p><Link to="">Back to the start</Link></p>
    </section>
  )
}

const useClientEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export default function App({ initialPath = '' }) {
  const path = useRoute(initialPath)
  const match = path.match(/^writing\/([^/]+)$/)
  const essay = match && essayBySlug(match[1])
  const isHome = path === ''

  useClientEffect(() => {
    const y = takeRestoreY()
    const id = window.location.hash.slice(1)
    const el = id && document.getElementById(id)
    if (y !== null) window.scrollTo({ top: y, behavior: 'instant' })
    else if (el) el.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [path])

  useEffect(() => {
    document.title = essay ? `${essay.title}, by ${person.name}` : HOME_TITLE
  }, [essay])

  let page
  if (isHome) page = <Home />
  else if (essay) page = <Essay essay={essay} />
  else page = <NotFound />

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Nav over={isHome} />
      <main id="main" key={path}>{page}</main>
    </>
  )
}
