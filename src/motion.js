// All page motion in one place. Nothing here is needed to read the page: with
// reduced motion, or before this runs, everything is simply shown.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

export function startMotion(root = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('motion')
  if (reduced) document.documentElement.classList.add('still')

  // Reveal: elements rise into place the first time they enter the window.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('in')
      io.unobserve(e.target)
      if (e.target.dataset.count) countUp(e.target, reduced)
    }
  }, { rootMargin: '0px 0px -3% 0px', threshold: 0.01 })
  root.querySelectorAll('[data-reveal], [data-count]').forEach((el) => io.observe(el))

  if (reduced) return () => io.disconnect()

  // Scroll-linked progress: each [data-scroll] element gets --p from 0 to 1 as it
  // travels through the window. CSS turns that into parallax, focus and light.
  const tracked = [...root.querySelectorAll('[data-scroll]')]
  const words = [...root.querySelectorAll('[data-words]')]
  let frame = 0
  const update = () => {
    frame = 0
    const H = innerHeight
    for (const el of tracked) {
      const r = el.getBoundingClientRect()
      const mode = el.dataset.scroll
      const p = mode === 'leave' ? clamp(-r.top / Math.max(1, r.height - H * 0.2)) : clamp((H - r.top) / (H + r.height))
      el.style.setProperty('--p', p.toFixed(4))
    }
    for (const el of words) {
      const r = el.getBoundingClientRect()
      const p = clamp((H * 0.85 - r.top) / (r.height + H * 0.35))
      const spans = el.querySelectorAll('.w')
      const lit = p * spans.length * 1.08
      spans.forEach((s, i) => s.style.setProperty('--lit', clamp(lit - i).toFixed(3)))
    }
  }
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }

  // The hero's layers drift against the pointer at different depths, eased so
  // it feels like looking past someone rather than tracking a cursor.
  const hero = root.querySelector('[data-hero]')
  let mx = 0, my = 0, tx = 0, ty = 0, drift = 0
  const onPointer = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; if (!drift) drift = requestAnimationFrame(ease) }
  const ease = () => {
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06
    hero?.style.setProperty('--mx', mx.toFixed(4)); hero?.style.setProperty('--my', my.toFixed(4))
    drift = Math.abs(tx - mx) + Math.abs(ty - my) > 0.0005 ? requestAnimationFrame(ease) : 0
  }
  if (hero && matchMedia('(hover: hover)').matches) addEventListener('pointermove', onPointer, { passive: true })
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  update()

  return () => {
    io.disconnect()
    removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
    removeEventListener('pointermove', onPointer)
    cancelAnimationFrame(frame)
    cancelAnimationFrame(drift)
  }
}

// Numbers count up once, easing out, when they first come into view.
function countUp(el, reduced) {
  const to = Number(el.dataset.count), dec = Number(el.dataset.decimals || 0)
  const pre = el.dataset.prefix || '', suf = el.dataset.suffix || ''
  const fmt = (v) => pre + v.toFixed(dec) + suf
  if (reduced) { el.textContent = fmt(to); return }
  const t0 = performance.now(), dur = 1600
  const tick = (t) => {
    const k = clamp((t - t0) / dur), e = 1 - Math.pow(1 - k, 4)
    el.textContent = fmt(to * e)
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
