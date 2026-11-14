import { useEffect, useRef, useState } from 'react'
import { Link } from '../router'
import { person, questions, record } from '../content/site'

// Scraps of paper, so they stay legible on any colour underneath. Record and
// Contact are always one click away for anyone who doesn't want the tour.
export default function Nav({ active, isHome }) {
  const [open, setOpen] = useState(false)
  const panel = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => { if (!panel.current?.parentElement.contains(e.target)) setOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onDown) }
  }, [open])

  const list = [...questions.map((q) => ({ id: q.id, nav: q.nav })), { id: 'record', nav: record.nav }]
  const n = Math.min(Math.max(active, 0), list.length)

  return (
    <header className="nav">
      <Link to="" className="tag tag--name" aria-label={`${person.name}, back to the start`}>{person.name}</Link>
      <div className="nav__right">
        <Link to="#record" className="tag">Record</Link>
        <Link to="#contact" className="tag tag--contact">Contact</Link>
        <button type="button" className="tag" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="nav-panel">
          {isHome && n > 0 ? <span className="tag__n">{n} of {list.length}</span> : null}
          <span>{open ? 'Close' : 'Questions'}</span>
        </button>
        {open && (
          <nav className="panel" id="nav-panel" ref={panel} aria-label="Questions">
            <ol>
              {list.map((q, i) => (
                <li key={q.id}>
                  <Link to={`#${q.id}`} onClick={() => setOpen(false)}>{q.nav}</Link>
                </li>
              ))}
            </ol>
            <p className="panel__links">
              {person.links.slice(0, 2).map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
            </p>
          </nav>
        )}
      </div>
    </header>
  )
}
