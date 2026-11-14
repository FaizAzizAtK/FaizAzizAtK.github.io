// Vector-traces a photograph into rigid line art, directly from its pixels, so
// the drawing is 1:1 with the image. Contours are taken at several tone levels
// (marching squares), then simplified into straight segments with hard corners.
//   node scripts/trace-photo.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

// Minimal PNG reader: 8-bit RGBA or RGB, non-interlaced.
export function readPng(path) {
  const b = readFileSync(path)
  let p = 8, w, h, ct, idat = []
  while (p < b.length) {
    const len = b.readUInt32BE(p), type = b.toString('latin1', p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len)
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9] }
    if (type === 'IDAT') idat.push(data)
    p += 12 + len
  }
  const ch = ct === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat)), s = w * ch, out = new Uint8Array(w * h * 4)
  let prev = new Uint8Array(s), o = 0
  for (let y = 0; y < h; y++) {
    const f = raw[o++], line = new Uint8Array(s)
    for (let i = 0; i < s; i++) {
      const x = raw[o++], a = i >= ch ? line[i - ch] : 0, up = prev[i], c = i >= ch ? prev[i - ch] : 0
      let v = x
      if (f === 1) v += a
      else if (f === 2) v += up
      else if (f === 3) v += (a + up) >> 1
      else if (f === 4) { const q = a + up - c, pa = Math.abs(q - a), pb = Math.abs(q - up), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c }
      line[i] = v & 255
    }
    for (let x = 0; x < w; x++) { const k = (y * w + x) * 4; out[k] = line[x * ch]; out[k + 1] = line[x * ch + 1]; out[k + 2] = line[x * ch + 2]; out[k + 3] = ch === 4 ? line[x * ch + 3] : 255 }
    prev = line
  }
  return { w, h, data: out }
}

// Separable blur, three box passes, close to a Gaussian.
export function blur(src, w, h, sigma) {
  const r = Math.max(1, Math.round(sigma * 1.2))
  let a = Float32Array.from(src), b = new Float32Array(src.length)
  const pass = (from, to, W, H, step, line) => {
    for (let l = 0; l < H; l++) {
      let sum = 0
      const at = (i) => from[l * line + Math.min(W - 1, Math.max(0, i)) * step]
      for (let i = -r; i <= r; i++) sum += at(i)
      for (let i = 0; i < W; i++) { to[l * line + i * step] = sum / (2 * r + 1); sum += at(i + r + 1) - at(i - r) }
    }
  }
  for (let n = 0; n < 3; n++) {
    pass(a, b, w, h, 1, w); [a, b] = [b, a]
    pass(a, b, h, w, w, 1); [a, b] = [b, a]
  }
  return a
}

// Bilateral filter on the source pixels. Neighbours only count if their tone is
// close, so texture is averaged away while the edge of a collar or lip survives.
function bilateral(f, w, h, radius, sigmaS, sigmaR, passes) {
  let a = Float32Array.from(f), b = new Float32Array(f.length)
  const kernel = []
  for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) kernel.push([x, y, Math.exp(-(x * x + y * y) / (2 * sigmaS * sigmaS))])
  for (let n = 0; n < passes; n++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = a[y * w + x]; let sum = 0, wt = 0
        for (const [dx, dy, g] of kernel) {
          const u = x + dx, v = y + dy
          if (u < 0 || v < 0 || u >= w || v >= h) continue
          const d = a[v * w + u] - c, k = g * Math.exp(-(d * d) / (2 * sigmaR * sigmaR))
          sum += k * a[v * w + u]; wt += k
        }
        b[y * w + x] = sum / wt
      }
    }
    ;[a, b] = [b, a]
  }
  return a
}

// Upscale by a whole factor with bilinear filtering.
export function upscale(img, S, o = {}) {
  const { w, h, data } = img, W = w * S, H = h * S
  const lum = new Float32Array(W * H), al = new Float32Array(W * H)
  const srgb = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  let l0 = new Float32Array(w * h); const a0 = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    l0[i] = Math.pow(0.2126 * srgb(data[i * 4]) + 0.7152 * srgb(data[i * 4 + 1]) + 0.0722 * srgb(data[i * 4 + 2]), 1 / 2.2)
    a0[i] = data[i * 4 + 3] / 255
  }
  if (o.bilateral) l0 = bilateral(l0, w, h, 3, o.bilateral[0], o.bilateral[1], o.bilateral[2])
  const sample = (f, x, y) => {
    const x0 = Math.min(w - 2, Math.max(0, Math.floor(x))), y0 = Math.min(h - 2, Math.max(0, Math.floor(y))), fx = x - x0, fy = y - y0
    return (f[y0 * w + x0] * (1 - fx) + f[y0 * w + x0 + 1] * fx) * (1 - fy) + (f[(y0 + 1) * w + x0] * (1 - fx) + f[(y0 + 1) * w + x0 + 1] * fx) * fy
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = (x + 0.5) / S - 0.5, v = (y + 0.5) / S - 0.5; lum[y * W + x] = sample(l0, u, v); al[y * W + x] = sample(a0, u, v) }
  return { W, H, lum, al }
}

// Marching squares: every contour of `f` at `level`, skipping cells outside `mask`.
export function contours(f, W, H, level, mask) {
  const nodes = new Map(), link = (a, b) => { if (!nodes.has(a.id)) nodes.set(a.id, { ...a, n: [] }); if (!nodes.has(b.id)) nodes.set(b.id, { ...b, n: [] }); nodes.get(a.id).n.push(b.id); nodes.get(b.id).n.push(a.id) }
  const edge = (x, y, kind) => {
    const p = y * W + x
    if (kind === 0) { const a = f[p], b = f[p + 1]; return { id: 2 * p, x: x + (level - a) / (b - a), y } }
    const a = f[p], b = f[p + W]; return { id: 2 * p + 1, x, y: y + (level - a) / (b - a) }
  }
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const p = y * W + x
      if (mask && !(mask[p] && mask[p + 1] && mask[p + W] && mask[p + W + 1])) continue
      const c = (f[p] < level ? 8 : 0) | (f[p + 1] < level ? 4 : 0) | (f[p + W + 1] < level ? 2 : 0) | (f[p + W] < level ? 1 : 0)
      if (c === 0 || c === 15) continue
      const T = () => edge(x, y, 0), B = () => edge(x, y + 1, 0), Lf = () => edge(x, y, 1), R = () => edge(x + 1, y, 1)
      const seg = { 1: [[Lf, B]], 2: [[B, R]], 3: [[Lf, R]], 4: [[T, R]], 6: [[T, B]], 7: [[Lf, T]], 8: [[Lf, T]], 9: [[T, B]], 11: [[T, R]], 12: [[Lf, R]], 13: [[B, R]], 14: [[Lf, B]] }[c]
      if (seg) seg.forEach(([a, b]) => link(a(), b()))
      else if (c === 5) { link(Lf(), T()); link(B(), R()) } else { link(Lf(), B()); link(T(), R()) }
    }
  }
  const seen = new Set(), out = []
  const walk = (start) => {
    const line = []; let cur = start, prev = null
    while (cur !== undefined && !seen.has(cur)) {
      seen.add(cur); const nd = nodes.get(cur); line.push([nd.x, nd.y])
      const next = nd.n.find((v) => v !== prev && !seen.has(v)); prev = cur; cur = next
    }
    return line
  }
  for (const [id, nd] of nodes) if (nd.n.length === 1 && !seen.has(id)) out.push({ pts: walk(id), closed: false })
  for (const [id] of nodes) if (!seen.has(id)) { const pts = walk(id); out.push({ pts, closed: true }) }
  return out
}

const inPoly = (x, y, poly) => {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Canny edges: thin ridges of strong gradient, kept only where the image really
// changes, so skin tone and fabric weave don't become lines. Returns pixel chains.
export function edgeChains(g, W, H, mask, hi, lo) {
  const gx = new Float32Array(W * H), gy = new Float32Array(W * H), mag = new Float32Array(W * H)
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const p = y * W + x
      const a = g[p - W - 1], b = g[p - W], c = g[p - W + 1], d = g[p - 1], e = g[p + 1], f = g[p + W - 1], h = g[p + W], i = g[p + W + 1]
      gx[p] = c + 2 * e + i - a - 2 * d - f; gy[p] = f + 2 * h + i - a - 2 * b - c
      mag[p] = Math.hypot(gx[p], gy[p])
    }
  }
  const at = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, p = j * W + i; return (mag[p] * (1 - u) + mag[p + 1] * u) * (1 - v) + (mag[p + W] * (1 - u) + mag[p + W + 1] * u) * v }
  const ridge = new Float32Array(W * H)
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < W - 2; x++) {
      const p = y * W + x, m = mag[p]
      if (!mask[p] || m < lo[p]) continue
      const nx = gx[p] / m, ny = gy[p] / m
      if (m >= at(x + nx, y + ny) && m > at(x - nx, y - ny)) ridge[p] = m
    }
  }
  const on = new Uint8Array(W * H), stack = []
  const N = [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]
  for (let p = 0; p < W * H; p++) if (ridge[p] >= hi[p] && ridge[p] > 0) { on[p] = 1; stack.push(p) }
  while (stack.length) { const p = stack.pop(); for (const d of N) { const q = p + d; if (q >= 0 && q < W * H && !on[q] && ridge[q] > 0) { on[q] = 1; stack.push(q) } } }
  const seen = new Uint8Array(W * H), chains = []
  const free = (p) => N.map((d) => p + d).filter((q) => q >= 0 && q < W * H && on[q] && !seen[q])
  const follow = (start) => {
    const line = []; let p = start, dx = 0, dy = 0
    for (;;) {
      seen[p] = 1; const x = p % W, y = (p - x) / W; line.push([x, y])
      const next = free(p); if (!next.length) break
      let best = next[0], score = -9
      for (const q of next) { const qx = q % W, qy = (q - qx) / W, ux = qx - x, uy = qy - y, s = (ux * dx + uy * dy) / Math.hypot(ux, uy); if (s > score) { score = s; best = q } }
      const bx = best % W, by = (best - bx) / W
      dx = dx * 0.6 + (bx - x) * 0.4; dy = dy * 0.6 + (by - y) * 0.4; p = best
    }
    return line
  }
  for (let p = 0; p < W * H; p++) if (on[p] && !seen[p] && free(p).length === 1) chains.push(follow(p))
  for (let p = 0; p < W * H; p++) if (on[p] && !seen[p]) chains.push(follow(p))
  return chains
}

// Edge detection leaves a line broken wherever contrast dips. Ends that meet and
// point at each other are the same stroke, so join them. `gap` is in pixels.
export function joinChains(chains, gap) {
  const dir = (c, last) => {
    const n = c.pts.length, k = Math.min(n - 1, 12)
    const a = last ? c.pts[n - 1] : c.pts[0], b = last ? c.pts[n - 1 - k] : c.pts[k]
    const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1
    return [dx / L, dy / L]
  }
  const end = (c, last) => (last ? c.pts[c.pts.length - 1] : c.pts[0])
  for (let changed = true; changed;) {
    changed = false
    const cand = []
    for (let i = 0; i < chains.length; i++) {
      for (let j = i + 1; j < chains.length; j++) {
        for (const ei of [0, 1]) {
          for (const ej of [0, 1]) {
            const p = end(chains[i], ei), q = end(chains[j], ej), d = Math.hypot(q[0] - p[0], q[1] - p[1])
            if (d > gap * 7) continue
            const u = [(q[0] - p[0]) / (d || 1), (q[1] - p[1]) / (d || 1)], da = dir(chains[i], ei), db = dir(chains[j], ej)
            const s1 = da[0] * u[0] + da[1] * u[1], s2 = -(db[0] * u[0] + db[1] * u[1])
            if (da[0] * db[0] + da[1] * db[1] > 0.2) continue
            if (d > 2 && (s1 < 0.4 || s2 < 0.4)) continue
            // a longer gap only closes when both ends lie on the same straight line
            if (d > gap && (s1 < 0.985 || s2 < 0.985)) continue
            cand.push({ i, j, ei, ej, score: d * (2 - Math.min(s1, s2)) })
          }
        }
      }
    }
    cand.sort((a2, b2) => a2.score - b2.score)
    const used = new Set()
    for (const { i, j, ei, ej } of cand) {
      if (used.has(i) || used.has(j)) continue
      used.add(i); used.add(j)
      const A = ei ? chains[i].pts : [...chains[i].pts].reverse(), B = ej ? [...chains[j].pts].reverse() : chains[j].pts
      chains[i] = { pts: [...A, ...B], minLen: Math.min(chains[i].minLen, chains[j].minLen), eps: Math.min(chains[i].eps, chains[j].eps), clear: Math.max(chains[i].clear ?? 0, chains[j].clear ?? 0) || undefined }
      chains[j] = null
      changed = true
    }
    chains = chains.filter(Boolean)
  }
  for (const c of chains) {
    const p = c.pts[0], q = c.pts[c.pts.length - 1]
    if (c.pts.length > gap * 4 && Math.hypot(p[0] - q[0], p[1] - q[1]) <= gap) { c.pts.push(p); c.loop = true }
  }
  return chains
}

// A line that stops just short of the outline should meet it.
function snapEnds(chains, outline, reach) {
  for (const c of chains) {
    if (c.loop) continue
    for (const last of [false, true]) {
      const n = c.pts.length, p = last ? c.pts[n - 1] : c.pts[0], b = last ? c.pts[Math.max(0, n - 12)] : c.pts[Math.min(n - 1, 11)]
      const L = Math.hypot(p[0] - b[0], p[1] - b[1]) || 1, dx = (p[0] - b[0]) / L, dy = (p[1] - b[1]) / L
      let best = null, bestD = reach
      for (const q of outline) {
        const d = Math.hypot(q[0] - p[0], q[1] - p[1])
        if (d < bestD && d > 0 && ((q[0] - p[0]) * dx + (q[1] - p[1]) * dy) / d > 0.25) { bestD = d; best = q }
      }
      if (best) { if (last) c.pts.push(best); else c.pts.unshift(best) }
    }
  }
}

// A jaw fades into shadow rather than ending in a hard edge, so edge detection
// breaks it up. Given a rough line, look across it at each step for where the tone
// drops fastest going outward, then take the smoothest route through those drops
// (dynamic programming). The result is one continuous line that sits on the image.
export function followEdge(f, W, H, S, { prior, centre, band = 5, reach = 2.5, bend = 0.012 }) {
  const sample = (x, y) => {
    const u = Math.min(W - 2, Math.max(0, x * S)), v = Math.min(H - 2, Math.max(0, y * S)), i = Math.floor(u), j = Math.floor(v), a = u - i, b = v - j, p = j * W + i
    return (f[p] * (1 - a) + f[p + 1] * a) * (1 - b) + (f[p + W] * (1 - a) + f[p + W + 1] * a) * b
  }
  const path = []
  for (let k = 0; k < prior.length - 1; k++) {
    const [x0, y0] = prior[k], [x1, y1] = prior[k + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)))
    for (let t = 0; t < n; t++) path.push([x0 + ((x1 - x0) * t) / n, y0 + ((y1 - y0) * t) / n])
  }
  path.push(prior[prior.length - 1])
  const normals = path.map((p, i) => {
    const a = path[Math.max(0, i - 3)], b = path[Math.min(path.length - 1, i + 3)]
    let nx = b[1] - a[1], ny = a[0] - b[0]; const L = Math.hypot(nx, ny) || 1
    nx /= L; ny /= L
    return (p[0] - centre[0]) * nx + (p[1] - centre[1]) * ny < 0 ? [-nx, -ny] : [nx, ny]
  })
  const offsets = []; for (let d = -band; d <= band + 1e-6; d += 0.5) offsets.push(d)
  let best = offsets.map(() => 0); const back = []
  path.forEach((p, i) => {
    const [nx, ny] = normals[i], next = new Array(offsets.length).fill(-Infinity), from = new Array(offsets.length).fill(0)
    offsets.forEach((d, o) => {
      const drop = sample(p[0] + nx * (d - reach), p[1] + ny * (d - reach)) - sample(p[0] + nx * (d + reach), p[1] + ny * (d + reach))
      for (let q = Math.max(0, o - 1); q <= Math.min(offsets.length - 1, o + 1); q++) {
        const v = best[q] - bend * Math.abs(o - q) + drop - 0.0015 * Math.abs(d)
        if (v > next[o]) { next[o] = v; from[o] = q }
      }
    })
    best = next; back.push(from)
  })
  let o = best.indexOf(Math.max(...best)); const out = new Array(path.length)
  for (let i = path.length - 1; i >= 0; i--) {
    const d = offsets[o]; out[i] = [(path[i][0] + normals[i][0] * d) * S, (path[i][1] + normals[i][1] * d) * S]; o = back[i][o]
  }
  return out
}

// Douglas-Peucker: keep only the corners, so curves become straight segments.
export function rigid(pts, eps) {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop(); let best = -1, at = -1
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
    for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > best) { best = d; at = i } }
    if (best > eps) { keep[at] = 1; stack.push([a, at], [at, b]) }
  }
  return pts.filter((_, i) => keep[i])
}

export const rigidLoop = (p, eps) => {
  const far = p.reduce((b, q, i) => (Math.hypot(q[0] - p[0][0], q[1] - p[0][1]) > Math.hypot(p[b][0] - p[0][0], p[b][1] - p[0][1]) ? i : b), 0)
  return [...rigid(p.slice(0, far + 1), eps), ...rigid([...p.slice(far), p[0]], eps).slice(1)]
}

export const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const [x, y] = p[i], [u, v] = p[(i + 1) % p.length]; s += x * v - u * y } return Math.abs(s) / 2 }
export const length = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0)

// Each zone of the picture gets its own sensitivity: fine around eyes and mouth,
// boosted in dark hair, strict on cloth so weave never becomes lines.
export function trace(path, o) {
  const S = o.scale ?? 4
  const { W, H, lum, al } = upscale(readPng(path), S, o)
  // tone is compressed so an edge in dark hair counts as much as one in light skin
  const k = Math.log(0.07), tone = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) tone[i] = (Math.log(lum[i] * 0.93 + 0.07) - k) / -k
  const a = blur(al, W, H, 1), inner = blur(al, W, H, 6)
  const zones = [{ ...o.base }, ...(o.zones ?? [])]
  const owner = new Uint8Array(W * H), solid = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x
      // keep clear of the cut-out's soft edge, or it gets traced twice
      solid[p] = inner[p] > 0.9 ? 1 : 0
      if (!solid[p]) continue
      for (let z = 1; z < zones.length; z++) {
        const Z = zones[z]
        if (x / S >= Z.box[0] && y / S >= Z.box[1] && x / S <= Z.box[2] && y / S <= Z.box[3] && (!Z.poly || inPoly(x / S, y / S, Z.poly))) { owner[p] = z; break }
      }
    }
  }
  const lines = []
  const push = (pts, heavy, closed = false) => lines.push({ pts: pts.map(([x, y]) => [+(x / S).toFixed(1), +(y / S).toFixed(1)]), closed, heavy })
  const outline = []
  contours(a, W, H, 0.5).forEach((c) => {
    if ((c.closed && area(c.pts) < 60 * S * S) || c.pts.length < 40) return
    outline.push(...c.pts)
    push(c.closed ? rigidLoop(c.pts, o.eps * S) : rigid(c.pts, o.eps * S), true, c.closed)
  })
  let chains = []
  const fields = new Map()
  const field = (sm) => { if (!fields.has(sm)) fields.set(sm, blur(tone, W, H, sm)); return fields.get(sm) }
  const relief = (sm, r) => {
    const key = `${sm}/${r}`
    if (!fields.has(key)) { const f = field(sm), b = field(r), v = new Float32Array(W * H); for (let i = 0; i < W * H; i++) v[i] = f[i] - b[i]; fields.set(key, v) }
    return fields.get(key)
  }
  zones.forEach((Z, z) => {
    if (Z.skip) return
    const m = new Uint8Array(W * H)
    for (let i = 0; i < W * H; i++) m[i] = solid[i] && owner[i] === z ? 1 : 0
    for (const e of Z.edges ?? []) {
      const hi = new Float32Array(W * H).fill(e.hi), lo = new Float32Array(W * H).fill(e.lo)
      for (const pts of edgeChains(field(e.smooth), W, H, m, hi, lo)) {
        if (pts.length >= 2 * S) chains.push({ pts, minLen: e.minLen, eps: e.eps ?? o.eps, clear: e.clear })
      }
    }
    // a feature is whatever stands darker or lighter than the skin around it,
    // so it comes out as one closed shape instead of a scatter of edges
    for (const f of Z.shapes ?? []) {
      for (const c of contours(relief(f.smooth ?? 1.6, f.local ?? 70), W, H, f.level, m)) {
        if (c.closed) { if (area(c.pts) >= (f.minArea ?? 10) * S * S) push(rigidLoop(c.pts, (f.eps ?? 0.45) * S), false, true) }
        else if (length(c.pts) >= (f.minLen ?? 8) * S) chains.push({ pts: c.pts, minLen: f.minLen ?? 8, eps: f.eps ?? 0.45 })
      }
    }
  })
  // the outline of the face, drawn as single lines in the same weight as the silhouette
  for (const g of o.guides ?? []) {
    const pts = followEdge(field(g.smooth ?? 2.5), W, H, S, g)
    const line = [...(g.from ? [g.from.map((v) => v * S)] : []), ...pts, ...(g.to ? [g.to.map((v) => v * S)] : [])]
    outline.push(...line)
    push(rigid(line, (g.eps ?? 1) * S), !g.light)
  }
  for (const l of o.levels ?? []) {
    const f = Float32Array.from(field(l.smooth ?? 2)), m = new Uint8Array(W * H)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const u = x / S, v = y / S
        m[y * W + x] = solid[y * W + x] && u >= l.box[0] && v >= l.box[1] && u <= l.box[2] && v <= l.box[3] ? 1 : 0
        if ((l.clear ?? []).some((q) => inPoly(u, v, q))) f[y * W + x] = 1
      }
    }
    const found = contours(f, W, H, l.level, m).filter((c) => length(c.pts) >= l.minLen * S).sort((p, q) => length(q.pts) - length(p.pts))
    for (const c of l.longest ? found.slice(0, 1) : found) {
      outline.push(...c.pts)
      const line = c.pts
      push(c.closed ? rigidLoop(line, (l.eps ?? 1) * S) : rigid(line, (l.eps ?? 1) * S), true, c.closed)
    }
  }
  chains = joinChains(chains, (o.gap ?? 3.5) * S)
  chains = chains.filter((c) => length(c.pts) >= c.minLen * S)
  // a stroke running alongside the outline is the same edge seen twice
  const near = new Float32Array(W * H).fill(1e9), R = 6 * S
  for (let i = 0; i < outline.length; i += 2) {
    const [cx, cy] = outline[i]
    for (let y = Math.max(0, Math.round(cy - R)); y <= Math.min(H - 1, Math.round(cy + R)); y++) {
      for (let x = Math.max(0, Math.round(cx - R)); x <= Math.min(W - 1, Math.round(cx + R)); x++) {
        const d = Math.hypot(x - cx, y - cy), p = y * W + x
        if (d < near[p]) near[p] = d
      }
    }
  }
  chains = chains.filter((c) => c.pts.filter(([x, y]) => near[Math.round(y) * W + Math.round(x)] <= (c.clear ?? 3) * S).length / c.pts.length < 0.6)
  snapEnds(chains, outline, 3.5 * S)
  for (const c of chains) {
    const pts = c.loop ? rigidLoop(c.pts.slice(0, -1), c.eps * S) : rigid(c.pts, c.eps * S)
    if (pts.length >= 2) push(pts, false, !!c.loop)
  }
  lines.sort((p, q) => Math.min(...p.pts.map((t) => t[1])) - Math.min(...q.pts.map((t) => t[1])))
  return lines
}

export const toPath = (l) => 'M' + l.pts.map((p) => p.join(' ')).join('L') + (l.closed ? 'Z' : '')

if (process.argv[1]?.endsWith('trace-photo.mjs')) {
  const root = new URL('../', import.meta.url).pathname
  // The face stays empty: only its outline is drawn. FACE is everything inside
  // that outline, pulled in a little so the hairline and jaw belong to the outline.
  const FACE = [[156, 252], [155, 234], [159, 218], [167, 204], [181, 193], [197, 183], [214, 176], [230, 174], [243, 177], [256, 182], [268, 186], [281, 184], [290, 188], [299, 200], [304, 216], [307, 236], [309, 252], [313, 262], [313, 285], [309, 306], [302, 318], [292, 332], [280, 346], [262, 352], [240, 354], [220, 352], [200, 347], [180, 336], [166, 318], [158, 298], [154, 276]]
  const UNDER_JAW = [[162, 322], [190, 352], [230, 360], [276, 352], [279, 376], [240, 392], [190, 386], [164, 362]]
  const JAW = [[161, 322], [164, 327], [170, 335], [180, 343], [192, 349], [205, 353], [220, 356], [235, 357], [250, 356.5], [262, 354], [272, 351], [281, 348.5]]
  const P = trace(`${root}design/source-photos/photo.png`, {
    scale: 4, bilateral: [1.5, 0.05, 2], eps: 1, gap: 4,
    base: { edges: [{ smooth: 5, hi: 0.02, lo: 0.009, minLen: 26 }] },
    zones: [
      { skip: true, box: [100, 165, 345, 362], poly: FACE },
      { skip: true, box: [150, 320, 290, 395], poly: UNDER_JAW },
      { skip: true, box: [146, 290, 170, 330] },
      { box: [50, 425, 125, 460], shapes: [{ smooth: 2, local: 44, level: -0.09, minArea: 20, eps: 0.6 }] },
      { box: [100, 90, 345, 262], edges: [{ smooth: 1.8, hi: 0.022, lo: 0.01, minLen: 8, eps: 0.9, clear: 5 }] },
      { box: [100, 262, 345, 334], edges: [{ smooth: 2.2, hi: 0.03, lo: 0.014, minLen: 7, eps: 0.8 }] },
      { box: [278, 390, 300, 448], edges: [{ smooth: 2.4, hi: 0.075, lo: 0.04, minLen: 14, eps: 0.9, clear: 4 }] },
      { box: [200, 492, 300, 584], edges: [{ smooth: 3.5, hi: 0.016, lo: 0.008, minLen: 24, eps: 0.9 }] },
      { box: [150, 334, 335, 584], edges: [{ smooth: 2.4, hi: 0.036, lo: 0.016, minLen: 12, eps: 0.9 }] },
    ],
    guides: [
      { prior: JAW, centre: [232, 270], smooth: 3, band: 4, reach: 3, eps: 0.8, bend: 0.05, from: [160, 321], to: [281.5, 348.5] },
      { prior: [[73, 464], [85, 490], [100, 525], [112, 558], [122, 583]], centre: [40, 560], smooth: 3, band: 4, reach: 2, eps: 0.9, light: true },
    ],
    levels: [{
      smooth: 2, level: 0.6, box: [125, 150, 335, 262], minLen: 120, eps: 0.9, longest: true,
      clear: [[[172, 202], [190, 197], [224, 199], [226, 248], [172, 248]], [[250, 198], [290, 198], [300, 206], [304, 220], [304, 250], [250, 250]]],
    }],
  })
  const PFACE = [[243, 50], [283, 51], [292, 64], [291, 79], [285, 90], [272, 96], [262, 98], [257, 90], [245, 84], [241, 70]]
  const Q = trace(`${root}design/source-photos/speaking.png`, {
    scale: 4, bilateral: [1.3, 0.05, 2], eps: 0.9, gap: 3.5,
    base: { edges: [{ smooth: 2.6, hi: 0.04, lo: 0.018, minLen: 13 }] },
    zones: [
      { skip: true, box: [184, 204, 204, 226] },
      { skip: true, box: [236, 44, 296, 102], poly: PFACE },
      { skip: true, box: [258, 86, 300, 126], poly: [[262, 101], [290, 88], [296, 99], [269, 122], [263, 112]] },
      { box: [226, 14, 318, 104], edges: [{ smooth: 1.5, hi: 0.03, lo: 0.013, minLen: 7, eps: 0.7 }] },
      { box: [204, 84, 284, 150], edges: [{ smooth: 1.3, hi: 0.03, lo: 0.014, minLen: 5, eps: 0.6 }] },
    ],
    guides: [
      { prior: [[291, 81], [289, 87], [284, 92], [279, 96], [271, 98.5], [262, 100]], centre: [266, 72], smooth: 1.6, band: 2, reach: 1.6, eps: 0.6 },
      { prior: [[241, 63], [244, 60], [245, 54], [247, 48.5], [253, 46.5], [260, 46], [267, 47.5], [274, 50], [280, 54.5], [284.5, 58.5], [288, 63], [290, 67]], centre: [266, 72], smooth: 1.6, band: 2.5, reach: 1.6, eps: 0.6 },
    ],
  })
  const pack = (L, viewBox) => ({ viewBox, paths: L.map((l) => ({ d: toPath(l), ...(l.heavy ? { heavy: true } : {}) })) })
  const js = `// Generated by scripts/trace-photo.mjs: traced directly from the photographs.\nexport const PORTRAIT = ${JSON.stringify(pack(P, '0 92 397 492'))}\nexport const PODIUM = ${JSON.stringify(pack(Q, '10 10 360 462'))}\n`
  writeFileSync(`${root}src/content/drawings.js`, js)
  console.log('portrait lines', P.length, 'points', P.reduce((s, l) => s + l.pts.length, 0), '| podium lines', Q.length, 'points', Q.reduce((s, l) => s + l.pts.length, 0), '|', Math.round(js.length / 1024), 'KB')
}
