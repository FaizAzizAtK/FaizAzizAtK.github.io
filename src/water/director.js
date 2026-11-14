// Ties the water to the page. When a sheet arrives, colour spreads along its
// writing in reading order, fast enough that nobody waits to read it, and then
// goes on to fill the window. Scrolling only moves on; it never unlocks text.

import { PIGMENTS } from './Water'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t) => t * t * (3 - 2 * t)
const rand = (seed) => { const x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x) }

// How much pigment a colour needs before white writing reads at 4.7:1. Pale
// pigments like ochre need far more paint than dark ones like indigo.
function depthFor(a, b) {
  const lum = (d) => [0.2126, 0.7152, 0.0722].reduce((sum, w, k) => sum + w * Math.exp((-(a[k] + b[k]) / 2) * d), 0)
  let lo = 0.1, hi = 4
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (lum(m) > 0.173) lo = m; else hi = m }
  return hi
}

function textBox(el) {
  const r = document.createRange()
  r.selectNodeContents(el)
  const rects = [...r.getClientRects()].filter((b) => b.width > 1 && b.height > 1)
  const src = rects.length ? rects : [el.getBoundingClientRect()]
  return {
    left: Math.min(...src.map((b) => b.left)), right: Math.max(...src.map((b) => b.right)),
    top: Math.min(...src.map((b) => b.top)), bottom: Math.max(...src.map((b) => b.bottom)),
  }
}

// Lay points across a block row by row, so the colour travels as you read.
function layPoints(box, W, H, seed) {
  const gapX = Math.max(190, W * 0.15), gapY = Math.max(170, H * 0.22)
  const w = box.right - box.left, h = box.bottom - box.top
  const rows = Math.max(1, Math.round(h / gapY)), cols = Math.max(1, Math.round(w / gapX))
  const pts = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = seed + r * 7.3 + c * 3.1
      pts.push({
        x: box.left + (w * (c + 0.5 + (rand(k) - 0.5) * 0.5)) / cols,
        y: box.top + (h * (r + 0.5 + (rand(k + 2) - 0.5) * 0.6)) / rows,
      })
    }
  }
  return pts
}

export class Director {
  constructor(water, { reduced = false } = {}) {
    this.water = water
    this.reduced = reduced
    this.sheets = []
    this.smoothY = window.scrollY
    this.lastOffset = null
    this.last = performance.now()
    this.energy = 1
    this.frames = []
    this.tier = 0
    this.active = -1
    this.lastInput = performance.now()
    this.tickCount = 0
    this.onPointer = (e) => {
      this.lastInput = performance.now()
      const x = e.clientX / innerWidth, y = e.clientY / innerHeight
      if (this.mouse) water.stir(x, y, (x - this.mouse[0]) * 7000, (y - this.mouse[1]) * 7000, 0.0022)
      this.mouse = [x, y]
    }
    // a click or tap anywhere pours a little more of the sheet's colour
    this.drops = []
    this.onClick = (e) => {
      if (e.target.closest('a, button, video, .nav')) return
      this.lastInput = performance.now()
      this.drops.push({ x: e.clientX / innerWidth, y: e.clientY / innerHeight, t: 0, bias: Math.random() })
    }
    if (!reduced) {
      window.addEventListener('pointermove', this.onPointer, { passive: true })
      window.addEventListener('click', this.onClick)
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.onPointer)
    window.removeEventListener('click', this.onClick)
    window.removeEventListener('resize', this.onResize)
    this.ro?.disconnect()
  }

  // config: [{ el, pin, pigments, blocks: [{ el, from, to, density }], auto }]
  mount(config) {
    this.config = config
    this.measure()
    this.onResize = () => { this.water.resize(); this.measure() }
    window.addEventListener('resize', this.onResize)
    this.ro = new ResizeObserver(() => this.measure())
    this.ro.observe(document.documentElement)
    this.t0 = performance.now()
    const loop = (t) => { this.tick(t); this.raf = requestAnimationFrame(loop) }
    this.raf = requestAnimationFrame(loop)
  }

  measure() {
    const W = innerWidth, H = this.water.canvas.clientHeight, sy = window.scrollY
    const old = this.sheets
    this.W = W; this.H = H
    this.sheets = this.config.map((c, i) => {
      const box = c.el.getBoundingClientRect()
      const start = box.top + sy, height = box.height
      const pinned = c.fixedPage ? 1e9 : c.pin ? Math.max(0, height - H) : 0
      const pinTopNow = (c.pin ?? c.el).getBoundingClientRect().top
      const gap = Math.hypot(Math.max(190, W * 0.15), Math.max(170, H * 0.22))
      const cover = (0.62 * gap) / H
      const blocks = c.blocks.map((b, k) => {
        const tb = textBox(b.el)
        const rel = { left: tb.left, right: tb.right, top: tb.top - pinTopNow, bottom: tb.bottom - pinTopNow }
        const prev = old[i]?.blocks[k]
        const lay = layPoints(rel, W, H, i * 11 + k * 5)
        const n = lay.length, span = 1 / n
        const pts = lay.map((p, j) => ({
          ...p, a: j * span * 0.72, b: j * span * 0.72 + span * 1.28 + 0.0001,
          f: prev?.pts[j]?.f ?? 0, r: Math.max(0.034, 44 / H), bias: 0.5 + 0.42 * Math.sin(j * 2.4 + i * 1.7),
          vol: 640 * cover * cover * (b.spread ?? 1) * (0.8 + 0.4 * rand(i + j + k)), seed: i * 3 + j * 1.3 + k,
        }))
        return { ...b, rel, pts, q: prev?.q ?? 0 }
      })
      // anything the writing did not reach gets colour afterwards, working outward
      const spots = []
      if (c.fill) {
        const cols = Math.ceil(W / (H * 0.4)), rows = 3
        for (let r = 0; r < rows; r++) {
          for (let q = 0; q < cols; q++) {
            const k = i * 13 + r * 5.7 + q * 2.3
            spots.push({ x: (W * (q + 0.5 + (rand(k) - 0.5) * 0.85)) / cols, y: (H * (r + 0.5 + (rand(k + 1) - 0.5) * 0.85)) / rows, k })
          }
        }
        // each sheet finishes filling from a different side
        const last = blocks[blocks.length - 1]?.pts.at(-1) ?? { x: W / 2, y: H / 2 }
        spots.sort((p, q) => Math.hypot(p.x - last.x, p.y - last.y) - Math.hypot(q.x - last.x, q.y - last.y))
      }
      const fill = spots.map((p, j) => ({
        ...p, a: (j / Math.max(1, spots.length)) * 0.74, b: (j / Math.max(1, spots.length)) * 0.74 + 0.36,
        f: old[i]?.fill[j]?.f ?? 0, r: 0.04, vol: 640 * 0.1 * (0.7 + 0.7 * rand(p.k)), bias: 0.5 + 0.46 * Math.sin(j * 1.9 + i), seed: p.k,
      }))
      const depth = depthFor(PIGMENTS[c.pigments[0]], PIGMENTS[c.pigments[1]])
      return { ...c, depth, start, height, pinned, blocks, fill, dripX: W * (0.3 + 0.4 * rand(i + 0.5)), clock: old[i]?.clock ?? 0, top: old[i]?.top ?? H }
    })
    this.pinRanges = this.sheets.map((s) => [s.start, s.pinned])
    this.lastOffset = null
  }

  // How far the page has physically moved: pinned stretches don't count.
  offsetAt(y) {
    let held = 0
    for (const [s, p] of this.pinRanges) held += clamp(y - s, 0, p)
    return y - held
  }

  pinTop(s, y) {
    if (s.fixedPage) return 0
    if (!s.pinned || y < s.start) return s.start - y
    return y > s.start + s.pinned ? s.start + s.pinned - y : 0
  }

  // Release colour at one point. The wobble keeps a bloom from growing as a circle.
  release(pt, target, density, dt, top, base, maxStep) {
    const d = target - pt.f
    if (Math.abs(d) < 1e-4) return 0
    const st = clamp(d, -maxStep, maxStep)
    pt.f += st
    const W = this.W, H = this.H, t = pt.f * 9 + pt.seed
    const px = (pt.x + Math.sin(t * 1.3) * H * 0.075) / W, py = (top + pt.y + Math.cos(t * 0.8) * H * 0.075) / H
    const vol = pt.vol * st, c = [0, 0, 0, 0]
    if (st > 0) { const a = density * vol * 0.075; c[base] = a * pt.bias; c[base + 1] = a * (1 - pt.bias) }
    this.water.dose(px, py, pt.r, c, vol / dt)
    return Math.abs(st)
  }

  paint(s, i, dt, maxStep) {
    const base = i % 2 ? 2 : 0
    let flow = 0, done = true
    s.blocks.forEach((b) => {
      const q = clamp((s.clock - b.at) / b.dur)
      b.q = q
      if (b.drawing && b.shown !== q) { b.shown = q; b.el.style.setProperty('--in', q.toFixed(3)) }
      if (q < 0.98) done = false
      b.pts.forEach((pt) => { flow += this.release(pt, smooth(clamp((q - pt.a) / (pt.b - pt.a))), s.depth * 1.5, dt, s.top, base, maxStep) })
    })
    if (s.fill.length) {
      const q = clamp((s.clock - s.fillAt) / s.fillFor)
      s.fillQ = q
      s.fill.forEach((pt) => { flow += this.release(pt, smooth(clamp((q - pt.a) / (pt.b - pt.a))), s.depth * 0.9, dt, s.top, base, maxStep) })
    }
    s.done = done
    return flow
  }

  tick(now) {
    const water = this.water, dt = Math.min((now - this.last) / 1000, 1 / 24) || 1 / 60
    this.watch(now - this.last)
    this.last = now
    const scrollY = window.scrollY
    const prevSmooth = this.smoothY
    this.smoothY = this.reduced ? scrollY : this.smoothY + (scrollY - this.smoothY) * (1 - Math.exp(-dt * 9))
    const y = this.smoothY

    // pigment travels with the paper, locked to the real scroll position
    const off = this.offsetAt(scrollY)
    if (this.lastOffset !== null) water.scroll(off - this.lastOffset)
    this.lastOffset = off

    const H = this.H
    let flow = 0, current = -1
    this.sheets.forEach((s, i) => {
      const top = this.pinTop(s, y)
      s.top = top
      if (top < H * 0.55 && top + H > H * 0.45) current = i
      if (!(top < H && top > -H)) {
        s.blocks.forEach((b) => {
          b.pts.forEach((p) => { p.f = 0 })
          if (b.drawing && b.shown) { b.shown = 0; b.el.style.setProperty('--in', '0') }
        })
        s.fill.forEach((p) => { p.f = 0 }); s.clock = 0
        return
      }
      if (i !== this.painting && top < H * 0.9) this.setPigments(s, i)
      if (this.reduced) {
        if (top < H * 0.7 && !s.still) this.paintStill(s, i)
        return
      }
      // the clock starts as a sheet slides in, so it is already spreading when it lands
      if (top < H * (s.enter ?? 0.66)) { s.clock += dt; flow += this.paint(s, i, dt, dt / 0.16) }
    })

    if (current !== this.active) { this.active = current; this.onActive?.(current) }

    const s = this.sheets[current]

    if (s && !this.reduced) {
      // the previous colour dissolves once this sheet has settled, so paints stay clean
      const settled = Math.abs(s.top) < 2
      const keep = Math.exp(-dt * (settled ? 1.5 : 0.25))
      water.clearChannels(current % 2 ? [keep, keep, 1, 1] : [1, 1, keep, keep])
      this.drip(current, Math.abs(scrollY - (this.prevScroll ?? scrollY)), dt)

      // near the end of a sheet the colour draws up, leaving a torn wet edge
      const left = s.start + s.pinned - scrollY
      const e = s.last || !s.pinned ? 0 : clamp(1 - left / (H * 0.16), 0, 2)
      if (e > 0) {
        const k = current % 2 ? [0, 0, 0.14, 0.14] : [0.14, 0.14, 0, 0]
        water.recede((s.top + H * (1.1 - 0.34 * clamp(e))) / H, k)
        water.hold(null)
      } else {
        const rects = s.blocks.filter((b) => b.q > 0.9).map((b) => [
          (b.rel.left + b.rel.right) / 2 / this.W, 1 - (s.top + (b.rel.top + b.rel.bottom) / 2) / H,
          (b.rel.right - b.rel.left) / 2 / this.W + 0.012, (b.rel.bottom - b.rel.top) / 2 / H + 0.016,
        ])
        // an article is read at length, so its whole window keeps a deeper, even wash
        const floor = s.fixedPage ? s.depth * 2 : s.depth * 0.5
        water.hold(s.fixedPage ? [] : rects, this.mixFor(current), s.depth * 1.5, s.fillQ > 0.8 ? floor : 0, s.fixedPage ? 0.5 : 0.16)
      }
    } else if (!this.reduced) water.hold(null)
    this.prevScroll = scrollY

    if (s && this.drops.length) {
      const base = current % 2 ? 2 : 0, T = 0.55
      this.drops = this.drops.filter((d) => d.t < T)
      for (const d of this.drops) {
        const k = dt / T, c = [0, 0, 0, 0]
        c[base] = s.depth * 2.2 * k * d.bias; c[base + 1] = s.depth * 2.2 * k * (1 - d.bias)
        water.dose(d.x, d.y, 0.03, c, 18 / T)
        d.t += dt; flow += k * 0.2
      }
    } else this.drops.length = 0

    water.wake = [0, clamp((scrollY - prevSmooth) / H, -1, 1) * -60]
    // a paper sheet goes almost still once painted, so its blooms keep their shape
    this.energy += (clamp((s?.paper ? 0.04 : 0.22) + flow * 18) - this.energy) * (1 - Math.exp(-dt * 2.2))
    water.energy = this.energy

    // once a painting has settled and nobody is touching it, ease off the GPU
    if (scrollY !== this.idleY) { this.idleY = scrollY; this.lastInput = now }
    const quiet = now - this.lastInput > 6000 && flow === 0
    this.tickCount += 1
    if (quiet && this.tickCount % 3) return
    if (!this.reduced) water.step(Math.max(dt, 1 / 90) * (quiet ? 3 : 1))
    water.render()
  }

  // As one sheet lifts away, a thread of its colour runs on down the fresh paper.
  drip(i, moved, dt) {
    const A = this.sheets[i], B = this.sheets[i + 1]
    if (!A || !B || !moved || !A.pinned || A.top > -2 || B.top <= 0 || B.top >= this.H) return
    const t = 1 - B.top / this.H, first = B.blocks[0]?.pts[0]
    if (!first) return
    const base = i % 2 ? 2 : 0, x = A.dripX + (first.x - A.dripX) * smooth(t) + Math.sin(t * 9) * 12
    const y = (0.8 + (first.y / this.H - 0.8) * t), a = (moved / this.H) * 0.9, c = [0, 0, 0, 0]
    c[base] = a; c[base + 1] = a * 0.5
    this.water.dose(x / this.W, y, 0.0075, c, 0)
  }

  // Reduced motion: a sheet arrives already painted, with nothing moving.
  paintStill(s, i) {
    s.still = true
    const steps = 240, dt = 1 / 60
    for (let n = 0; n < steps; n++) {
      s.clock += dt
      this.paint(s, i, dt, 1)
      this.water.step(dt)
    }
  }

  // If the device can't keep up, soften the render before it ever feels slow.
  watch(ms) {
    this.frames.push(ms)
    if (this.frames.length < 50) return
    const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    this.frames.length = 0
    if (avg > 40 && document.visibilityState === 'visible' && this.tier < 2) {
      this.tier += 1
      this.water.degrade(this.tier)
    }
  }

  mixFor(i) { return i % 2 ? [0, 0, 0.6, 0.4] : [0.6, 0.4, 0, 0] }

  setPigments(s, i) {
    this.painting = i
    const base = i % 2 ? 2 : 0
    this.water.look.pigments[base] = PIGMENTS[s.pigments[0]]
    this.water.look.pigments[base + 1] = PIGMENTS[s.pigments[1]]
  }
}
