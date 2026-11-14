import useInView from './useInView'

// The essay diagrams. Colours come from CSS variables; motion starts once in view.

function Fig({ viewBox, label, children }) {
  const [ref, inView] = useInView()
  return (
    <svg ref={ref} className={`fig${inView ? ' is-in' : ''}`} viewBox={viewBox} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

// ── Essay figures ───────────────────────────────────────────────────────────

function Hrag() {
  const picked = new Set([3, 14, 22, 37, 45])
  return (
    <Fig viewBox="0 0 720 300" label="Flat RAG picks five chunks from anywhere; hierarchical RAG reads the contents, picks one section, then five chunks inside it.">
      <text className="t-strong" x="20" y="24">Flat</text>
      <text className="t" x="20" y="42">top 5 from anywhere</text>
      {Array.from({ length: 48 }, (_, i) => (
        <circle key={i} className={picked.has(i) ? 'dot-red' : 'dot'} cx={30 + (i % 8) * 38} cy={80 + Math.floor(i / 8) * 36} r="6" />
      ))}
      <line className="rule" x1="360" y1="10" x2="360" y2="290" />
      <text className="t-strong" x="390" y="24">Hierarchical</text>
      <text className="t" x="390" y="42">contents first, then one section</text>
      <rect className="box" x="496" y="62" width="110" height="30" />
      <text className="t-strong" x="551" y="82" textAnchor="middle">Contents</text>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 390 + i * 66
        const on = i === 2
        return (
          <g key={i}>
            <path className="stroke" d={`M551 92 V106 H${x + 26} V130`} fill="none" />
            <rect className={on ? 'fill-red' : 'box'} x={x} y="130" width="52" height="30" />
            <text className={on ? 't-inv' : 't'} x={x + 26} y="150" textAnchor="middle">§{i + 1}</text>
            {(on ? [0, 1, 2, 3, 4] : [0, 1, 2]).map((j) => {
              const cx = on ? x + 26 - 32 + j * 16 : x + 14 + j * 12
              return <circle key={j} className={on ? 'dot-red' : 'dot'} cx={cx} cy="220" r={on ? 6 : 4} />
            })}
            {on && <path className="stroke" d={`M${x + 26} 160 V190`} fill="none" />}
          </g>
        )
      })}
      <text className="t" x="390" y="270">5 chunks, all from the section that matters</text>
    </Fig>
  )
}

function Context() {
  const steps = 8
  const unit = 58
  return (
    <Fig viewBox="0 0 720 300" label="With each agent step, tool results pile into the context window; older ones go stale and the instructions become a smaller share.">
      <text className="t" x="120" y="22">Context window →</text>
      <line className="limit" x1="682" y1="30" x2="682" y2="282" />
      <text className="t" x="676" y="22" textAnchor="end">limit</text>
      {Array.from({ length: steps }, (_, row) => (
        <g key={row}>
          <text className="t" x="104" y={48 + row * 30} textAnchor="end">step {row + 1}</text>
          <rect className="fill-red" x="120" y={34 + row * 30} width="56" height="20" />
          {Array.from({ length: row + 1 }, (_, k) => {
            const age = row - k
            return (
              <rect key={k} className="ctx-block" x={180 + k * unit} y={34 + row * 30} width={unit - 4} height="20"
                style={{ opacity: Math.max(0.14, 1 - age * 0.16) }} />
            )
          })}
        </g>
      ))}
    </Fig>
  )
}

function Loop() {
  const cx = 360
  const cy = 150
  const r = 100
  const nodes = [
    ['Perceive', cx, cy - r],
    ['Reason', cx + r, cy],
    ['Act', cx, cy + r],
    ['Observe', cx - r, cy],
  ]
  return (
    <Fig viewBox="0 0 720 300" label="An agent loops: perceive, reason, act, observe, towards a goal.">
      <circle className="ring" cx={cx} cy={cy} r={r} />
      <text className="t-strong" x={cx} y={cy + 4} textAnchor="middle">Goal</text>
      {nodes.map(([label, x, y]) => (
        <g key={label}>
          <rect className="box box--paper" x={x - 44} y={y - 15} width="88" height="30" />
          <text className="t-strong" x={x} y={y + 5} textAnchor="middle">{label}</text>
        </g>
      ))}
      <circle className="traveller" r="6">
        <animateMotion dur="6s" repeatCount="indefinite"
          path={`M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`} />
      </circle>
      <text className="t-strong" x="20" y="120">Co-pilot</text>
      <text className="t" x="20" y="140">you ask, it answers,</text>
      <text className="t" x="20" y="158">you decide</text>
      <text className="t-strong" x="700" y="120" textAnchor="end">Agent</text>
      <text className="t" x="700" y="140" textAnchor="end">it plans, acts, checks,</text>
      <text className="t" x="700" y="158" textAnchor="end">and goes round again</text>
    </Fig>
  )
}

const FIGURES = { hrag: Hrag, context: Context, loop: Loop }

export default function Figure({ id }) {
  const F = FIGURES[id]
  return F ? <F /> : null
}
