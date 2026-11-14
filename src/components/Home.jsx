import { forwardRef } from 'react'
import { Link } from '../router'
import { person, hero, questions, record, ending } from '../content/site'
import { ESSAYS } from '../content/essays'
import { PODIUM } from '../content/drawings'
import Drawing from './Drawing'

const BASE = import.meta.env.BASE_URL

const Block = forwardRef(function Block({ b, i }, ref) {
  const cls = `block block--${b.kind}`
  return (
    <div className={cls} data-block={i} ref={ref}>
      <p>{b.text}</p>
      {b.link && <p className="block__links"><a href={b.link.url} target="_blank" rel="noopener noreferrer">{b.link.label} ↗</a></p>}
      {b.links && (
        <p className="block__links">
          {b.links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
        </p>
      )}
    </div>
  )
})

function Question({ c }) {
  const cls = ['sheet', `sheet--${c.id}`, c.layout && `sheet--${c.layout}`, c.paper && 'sheet--paper'].filter(Boolean).join(' ')
  return (
    <section className={cls} id={c.id} data-sheet aria-labelledby={`${c.id}-q`}>
      <div className="pin" data-pin>
        <div className="pin__inner">
          <h2 className="q" id={`${c.id}-q`} data-q>{c.q}</h2>
          <div className="answers">
            {c.blocks.map((b, i) => <Block key={i} b={b} i={i} />)}
            {c.film && (
              <figure className="film" data-film>
                <video controls playsInline preload="none" poster={c.film.poster} aria-label={c.film.label}>
                  <source src={c.film.src} type="video/mp4" />
                </video>
              </figure>
            )}
            {c.hint && <p className="hint" data-hint>{c.hint}</p>}
            {c.essays && (
              <ol className="essay-list" data-essays>
                {ESSAYS.map((e) => (
                  <li key={e.slug} data-essay>
                    <Link to={`writing/${e.slug}`}>
                      <span className="essay-list__title">{e.title}</span>
                      <span className="essay-list__dek">{e.dek}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Rows({ title, rows }) {
  return (
    <div className="record__block">
      <h3>{title}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.when + r.what + r.role}>
            <span className="record__when">{r.when}</span>
            <span className="record__what">{r.what}<small>{r.role}</small></span>
            {r.where && <span className="record__where">{r.where}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <section className="sheet sheet--hero" id="top" data-sheet>
        <div className="pin" data-pin>
          <div className="pin__inner">
            <h1 className="hero__title" data-hero="title"><strong>{hero.name}</strong> {hero.headline}</h1>
            <p className="hero__who" data-hero="who">{hero.who}</p>
            <ul className="hero__skills" data-hero="skills" aria-label="Expertise">
              {hero.skills.map((k) => <li key={k}>{k}</li>)}
            </ul>
            <p className="hero__actions" data-hero="actions">
              <Link to="#record">See my record</Link>
            </p>
            <p className="hero__cue" data-hero="cue">{hero.cue}</p>
          </div>
          <figure className="drawing drawing--podium" data-drawing>
            <Drawing data={PODIUM} label="Line drawing of Faiz Aziz at a lectern with a laptop, speaking into a microphone" />
            <figcaption>Speaking to clients on agentic AI.</figcaption>
          </figure>
        </div>
      </section>

      {questions.map((c) => <Question key={c.id} c={c} />)}

      <section className="record" id="record" aria-labelledby="record-q">
        <div className="record__inner">
          <h2 className="q q--ink" id="record-q">{record.q}</h2>
          <header className="record__head">
            <p className="record__name">{person.name}</p>
            <p className="record__summary">{record.summary}</p>
            <p className="record__contact">
              <a href={`mailto:${person.email}`}>{person.email}</a>
              {person.links.slice(0, 2).map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
            </p>
          </header>
          <p className="record__actions">
            {person.cvUrl
              ? <a href={`${BASE}${person.cvUrl}`}>Download my CV</a>
              : <button type="button" onClick={() => window.print()}>Save this as a PDF</button>}
          </p>
          <div className="record__grid">
            <Rows title="Experience" rows={record.experience} />
            <Rows title="Education" rows={record.education} />
            <Rows title="Certifications" rows={record.certifications} />
            <div className="record__block">
              <h3>Toolkit</h3>
              <dl>
                {record.toolkit.map(({ k, v }) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet sheet--end" id="contact" data-sheet aria-labelledby="end-q">
        <div className="pin" data-pin>
          <div className="pin__inner">
            <h2 className="q q--end" id="end-q" data-q>{ending.q}</h2>
            <p className="end__bio" data-block={1}>{ending.bio}</p>
            <div className="end__row" data-block={0}>
              <a className="end__email" href={`mailto:${person.email}`}>{person.email}</a>
              <p className="end__links">
                {person.links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
              </p>
            </div>
            <p className="end__colophon">{ending.colophon}</p>
          </div>
        </div>
      </section>
    </>
  )
}

// What the director paints, read from the DOM once it's on the page. Times are
// seconds after a sheet arrives: all writing is out within two seconds. Most
// sheets then fill the window; a `paper` sheet keeps its colour to the writing.
export function homeConfig() {
  const get = (s, r = document) => r.querySelector(s)
  const out = []
  const h = get('#top')
  out.push({
    el: h, pin: get('[data-pin]', h), pigments: hero.pigments, fillAt: 1.4, fillFor: 3.2, enter: 1, fill: true,
    blocks: [
      { el: get('[data-hero=title]', h), at: 0.05, dur: 0.85 },
      { el: get('[data-hero=who]', h), at: 0.5, dur: 0.6, spread: 0.7 },
      { el: get('[data-hero=skills]', h), at: 0.7, dur: 0.5, spread: 0.6 },
      { el: get('[data-hero=actions]', h), at: 0.85, dur: 0.5, spread: 0.6 },
      { el: get('[data-drawing]', h), at: 0.6, dur: 2, drawing: true },
      { el: get('[data-hero=cue]', h), at: 1.1, dur: 0.5, spread: 0.6 },
    ],
  })
  questions.forEach((c) => {
    const el = get(`#${c.id}`)
    const blocks = [{ el: get('[data-q]', el), at: 0, dur: 0.6 }]
    c.blocks.forEach((b, i) => blocks.push({ el: get(`[data-block="${i}"]`, el), at: 0.28 + i * 0.26, dur: 0.6, spread: 0.8 }))
    let last = 0.28 + (c.blocks.length - 1) * 0.26 + 0.6
    if (c.essays) {
      el.querySelectorAll('[data-essay]').forEach((li, i) => blocks.push({ el: li, at: 0.5 + i * 0.22, dur: 0.5, spread: 0.7 }))
      last = 1.5
    }
    if (c.film) blocks.push({ el: get('[data-film]', el), at: 0.4, dur: 1, drawing: true })
    if (c.hint) blocks.push({ el: get('[data-hint]', el), at: 1.6, dur: 0.5, spread: 0.5 })
    out.push({ el, pin: get('[data-pin]', el), pigments: c.pigments, fillAt: last - 0.2, fillFor: 2.6, fill: !c.paper, paper: !!c.paper, blocks })
  })
  const end = get('#contact')
  out.push({
    el: end, pin: get('[data-pin]', end), pigments: ending.pigments, fillAt: 0.9, fillFor: 2.8, last: true, fill: true,
    blocks: [
      { el: get('[data-q]', end), at: 0, dur: 0.7 },
      { el: get('[data-block="1"]', end), at: 0.4, dur: 0.6, spread: 0.8 },
      { el: get('[data-block="0"]', end), at: 0.6, dur: 0.6 },
      { el: get('.end__colophon', end), at: 0.9, dur: 0.5, spread: 0.6 },
    ],
  })
  return out
}
