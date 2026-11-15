import { useEffect, useState } from 'react'
import { startMotion } from '../motion'
import { Link } from '../router'
import { ESSAYS } from '../content/essays'
import { person } from '../content/site'
import Figure from './Figures'

const CAPTIONS = {
  voice: 'Today you navigate the menu. With a voice agent, the menu finds you.',
  hrag: 'Same corpus, two ways to retrieve five chunks.',
  context: 'Each step adds tool output, and the instructions become a smaller share.',
  loop: 'The loop that separates an agent from a co-pilot.',
}

export default function Essay({ essay }) {
  const [copied, setCopied] = useState(false)
  const others = ESSAYS.filter((e) => e.slug !== essay.slug)
  const url = typeof window === 'undefined' ? '' : window.location.href.split('#')[0]

  useEffect(() => startMotion(), [essay.slug])

  const copyLink = () =>
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })

  return (
    <article className="essay">
      <header className="essay__head">
        <div className="essay__head-inner">
          <p className="essay__back" data-reveal><Link to="#writing">← All writing</Link></p>
          <h1 className="essay__title" data-reveal style={{ '--d': '80ms' }}>{essay.title}</h1>
          <p className="essay__dek" data-reveal style={{ '--d': '180ms' }}>{essay.dek}</p>
          <p className="essay__meta" data-reveal style={{ '--d': '260ms' }}>{essay.dateLabel}, {essay.minutes} minute read</p>
        </div>
      </header>

      <div className="essay__body">
        {essay.body.map((b, i) => {
          if (b.type === 'lead') return <p key={i} className="essay__lead">{b.text}</p>
          if (b.type === 'h2') return <h2 key={i}>{b.text}</h2>
          if (b.type === 'figure') return (
            <figure key={i} className="essay__fig">
              <div className="fig-scroll"><Figure id={essay.figure} /></div>
              <figcaption>{CAPTIONS[essay.figure]}</figcaption>
            </figure>
          )
          return <p key={i}>{b.text}</p>
        })}
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
