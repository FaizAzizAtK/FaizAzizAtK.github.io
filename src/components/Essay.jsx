import { useState } from 'react'
import { Link } from '../router'
import { ESSAYS } from '../content/essays'
import { person } from '../content/site'
import Figure from './Figures'

const CAPTIONS = {
  hrag: 'Same corpus, two ways to retrieve five chunks.',
  context: 'Each step adds tool output, and the instructions become a smaller share.',
  loop: 'The loop that separates an agent from a co-pilot.',
}

export default function Essay({ essay }) {
  const [copied, setCopied] = useState(false)
  const others = ESSAYS.filter((e) => e.slug !== essay.slug)
  const url = typeof window === 'undefined' ? '' : window.location.href.split('#')[0]

  const copyLink = () =>
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })

  return (
    <article className="essay" data-pigments={essay.figure}>
      <header className="essay__head" data-sheet>
        <div className="essay__head-inner" data-pin>
          <p className="essay__back"><Link to="#writing">Back to the questions</Link></p>
          <h1 className="essay__title" data-q>{essay.title}</h1>
          <p className="essay__dek" data-block="0">{essay.dek}</p>
          <p className="essay__meta" data-block="1">{essay.dateLabel}, {essay.minutes} minute read</p>
        </div>
      </header>

      <div className="essay__body">
        {essay.body.map((b, i) => {
          if (b.type === 'lead') return <p key={i} className="essay__lead">{b.text}</p>
          if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
          return <p key={i}>{b.text}</p>
        })}
        <figure className="essay__fig">
          <div className="fig-scroll"><Figure id={essay.figure} /></div>
          <figcaption>{CAPTIONS[essay.figure]}</figcaption>
        </figure>
      </div>

      <footer className="essay__foot">
        <div>
          <p>Written by {person.name}, {person.title} at {person.org}. Views are my own.</p>
          <p className="essay__share">
            <button type="button" onClick={copyLink} aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</button>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Share on LinkedIn ↗</a>
          </p>
        </div>
        <div>
          <h2>Keep reading</h2>
          <ul>
            {others.map((e) => (
              <li key={e.slug}><Link to={`writing/${e.slug}`}>{e.title}</Link></li>
            ))}
          </ul>
        </div>
      </footer>
    </article>
  )
}

export function essayConfig(essay) {
  const el = document.querySelector('[data-sheet]')
  if (!el) return []
  const get = (s) => el.querySelector(s)
  return [{
    el, pin: null, pigments: essay.pigments, fillAt: 0.9, fillFor: 2.2, enter: 1, fill: true, last: true, fixedPage: true,
    blocks: [
      { el: get('[data-q]'), at: 0.05, dur: 0.7 },
      { el: get('[data-block="0"]'), at: 0.4, dur: 0.6, spread: 0.7 },
      { el: get('[data-block="1"]'), at: 0.6, dur: 0.5, spread: 0.5 },
    ],
  }]
}
