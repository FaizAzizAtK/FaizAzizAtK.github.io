import { useEffect } from 'react'
import { Link } from '../router'
import { person, hero, belief, work, about, record, contact } from '../content/site'
import { ESSAYS } from '../content/essays'
import { startMotion } from '../motion'

const BASE = import.meta.env.BASE_URL

function Hero() {
  const cut = (w) => `${BASE}img/faiz-cross-${w}.webp`
  return (
    <section className="hero" id="top" data-scroll="leave" data-hero>
      {/* two flat fields, one hard seam, Faiz standing on it */}
      <div className="hero__field hero__field--a" aria-hidden="true" />
      <div className="hero__field hero__field--b" aria-hidden="true" />

      <h1 className="hero__name">
        <span className="hero__first">{person.first}</span>{' '}
        <span className="hero__last">{person.last}</span>
      </h1>

      <figure className="hero__person">
        <img
          src={cut(1000)}
          srcSet={`${cut(640)} 640w, ${cut(1000)} 1000w, ${cut(1800)} 1800w`}
          sizes="(max-width: 760px) 70vw, 40vw"
          width="1800"
          height="2673"
          alt="Faiz Aziz, smiling, arms crossed, in round wire glasses and a black long-sleeve T-shirt"
          fetchpriority="high"
        />
      </figure>

      <div className="hero__meta">
        <p className="hero__line" data-reveal style={{ '--d': '700ms' }}>{hero.line}</p>
        <p className="hero__who" data-reveal style={{ '--d': '800ms' }}>{hero.who}</p>
      </div>
      <div className="hero__side">
        <p className="hero__honour" data-reveal style={{ '--d': '850ms' }}>
          <span>{hero.honour}</span>
          <small>{hero.honourNote}</small>
        </p>
        <ul className="hero__skills" aria-label="Expertise" data-reveal style={{ '--d': '900ms' }}>
          {hero.skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <Link to="#work" className="hero__cue" data-reveal style={{ '--d': '1000ms' }}>
          <span>Selected work</span>
          <span className="hero__cue-arrow" aria-hidden="true">↓</span>
        </Link>
      </div>
    </section>
  )
}

function Belief() {
  return (
    <section className="belief on-ox" aria-labelledby="belief-label">
      <div className="belief__inner">
        <p className="label" id="belief-label">{belief.label}</p>
        <p className="belief__text" data-words>
          {belief.text.split(' ').map((w, i) => <span className="w" key={i}>{w} </span>)}
        </p>
      </div>
    </section>
  )
}

function ChapterText({ c }) {
  return (
    <div className="chapter__text">
      <p className="label" data-reveal>{c.kicker}</p>
      <h3 className="chapter__title" data-reveal style={{ '--d': '80ms' }}>{c.title}</h3>
      <p className="chapter__body" data-reveal style={{ '--d': '160ms' }}>{c.body}</p>
      {c.note && <p className="chapter__note" data-reveal style={{ '--d': '240ms' }}>{c.note}</p>}
      {c.links && (
        <p className="links" data-reveal style={{ '--d': '300ms' }}>
          {c.links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}
        </p>
      )}
    </div>
  )
}

// The lead chapter is a full-height split, like the hero: photograph left, story right.
function Feature({ c }) {
  return (
    <article className="feature" id={c.id} data-scroll>
      <figure className="feature__photo" data-reveal>
        <img
          src={`${BASE}${c.photo.src}`}
          srcSet={c.photo.srcSet.split(', ').map((x) => BASE + x).join(', ')}
          sizes="(max-width: 760px) 80vw, 460px"
          width={c.photo.w}
          height={c.photo.h}
          alt={c.photo.alt}
          loading="lazy"
        />
      </figure>
      <div className="feature__side">
        <p className="feature__word" data-reveal>{c.figure}</p>
        <ChapterText c={c} />
        {c.film && (
          <figure className="chapter__film" data-reveal style={{ '--d': '200ms' }}>
            <video controls playsInline preload="none" poster={c.film.poster} aria-label={c.film.label}>
              <source src={c.film.src} type="video/mp4" />
            </video>
            <figcaption>{c.film.label}</figcaption>
          </figure>
        )}
      </div>
    </article>
  )
}

function Chapter({ c }) {
  if (c.photo) return <Feature c={c} />
  const n = c.count
  return (
    <article className="chapter" id={c.id} data-scroll>
      <div className="chapter__figure">
        {n ? (
          <span aria-hidden="true" data-count={n.to} data-decimals={n.decimals} data-prefix={n.prefix || ''} data-suffix={n.suffix || ''}>{c.figure}</span>
        ) : <span className="chapter__word">{c.figure}</span>}
      </div>
      <ChapterText c={c} />
    </article>
  )
}

function Work() {
  return (
    <section className="work" id="work" aria-labelledby="work-h">
      <header className="section-head">
        <p className="label">Selected work</p>
        <h2 className="section-title" id="work-h" data-reveal>What I’ve <em>shipped</em>.</h2>
      </header>
      {work.map((c) => <Chapter key={c.id} c={c} />)}
    </section>
  )
}

function Writing() {
  return (
    <section className="writing" id="writing" aria-labelledby="writing-h">
      <header className="section-head">
        <p className="label">Writing</p>
        <h2 className="section-title" id="writing-h" data-reveal>What I <em>think</em>.</h2>
      </header>
      <ol className="essays">
        {ESSAYS.map((e, i) => (
          <li key={e.slug} data-reveal style={{ '--d': `${i * 90}ms` }}>
            <Link to={`writing/${e.slug}`} className="essay-row">
              <span className="essay-row__date">{e.dateLabel}</span>
              <span className="essay-row__title">{e.title}</span>
              <span className="essay-row__dek">{e.dek}</span>
              <span className="essay-row__go" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

function About() {
  return (
    <section className="about split" id="about" aria-labelledby="about-h">
      <div className="split__a">
        <p className="label">{about.label}</p>
        <h2 className="about__lead" id="about-h" data-reveal>{about.lead}</h2>
      </div>
      <div className="split__b on-ox">
        <div className="about__body">
          {about.body.map((p, i) => <p key={i} data-reveal style={{ '--d': `${100 + i * 100}ms` }}>{p}</p>)}
          <dl className="facts" data-reveal style={{ '--d': '300ms' }}>
            {about.facts.map((f) => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Rows({ title, rows }) {
  return (
    <div className="record__block" data-reveal>
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

function Record() {
  return (
    <section className="record" id="record" aria-labelledby="record-h">
      <header className="section-head">
        <p className="label">Record</p>
        <h2 className="section-title" id="record-h" data-reveal>In <em>writing</em>.</h2>
        <p className="record__actions">
          {person.cvUrl
            ? <a href={`${BASE}${person.cvUrl}`}>Download CV ↓</a>
            : <button type="button" onClick={() => window.print()}>Save as PDF ↓</button>}
        </p>
      </header>
      <div className="record__print-head">
        <p className="record__print-name">{person.name}</p>
        <p>{person.title}, {person.org}, {person.city} · {person.email}</p>
      </div>
      <div className="record__grid">
        <Rows title="Experience" rows={record.experience} />
        <Rows title="Education" rows={record.education} />
        <Rows title="Recognition" rows={record.recognition} />
        <Rows title="Certifications" rows={record.certifications} />
        <div className="record__block record__block--wide" data-reveal>
          <h3>Toolkit</h3>
          <dl>
            {record.toolkit.map(({ k, v }) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <div className="split">
        <div className="split__a">
          <p className="label">Contact</p>
          <h2 className="contact__line" id="contact-h" data-reveal>{contact.line}</h2>
        </div>
        <div className="split__b on-ox contact__reach">
          <p className="contact__sub" data-reveal style={{ '--d': '120ms' }}>{contact.sub}</p>
          <a className="contact__email" href={`mailto:${person.email}`} data-reveal style={{ '--d': '220ms' }}>{person.email}</a>
          <p className="links" data-reveal style={{ '--d': '320ms' }}>
            {person.links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}
          </p>
        </div>
      </div>
      <footer className="foot">
        <span>© {new Date().getFullYear()} {person.name}</span>
        <span>{person.city}</span>
      </footer>
    </section>
  )
}

export default function Home() {
  useEffect(() => startMotion(), [])
  return (
    <>
      <Hero />
      <Belief />
      <Work />
      <Writing />
      <About />
      <Record />
      <Contact />
    </>
  )
}
