import useInView from './useInView'

// The essay diagrams. Colours come from CSS variables. Once a figure scrolls
// into view it builds itself: lines draw in (.draw), parts settle in order
// (.a, delayed by --d), then a dot travels the route. Without JS, or with
// reduced motion, everything is simply shown.

function Fig({ viewBox, label, children }) {
  const [ref, inView] = useInView()
  return (
    <svg ref={ref} className={`fig${inView ? ' is-in' : ''}`} viewBox={viewBox} role="img" aria-label={label}>
      {children}
    </svg>
  )
}

const d = (ms) => ({ '--d': `${ms}ms` })

// a line that draws itself
function Line({ path, delay = 0, className = 'stroke' }) {
  return <path className={`${className} draw`} d={path} pathLength="1" style={d(delay)} />
}

// a dot that rides a path, on a loop, once the figure has built
function Traveller({ path, dur = 4, begin = 0, delay = 0 }) {
  return (
    <g className="a" style={d(delay)}>
      <circle className="traveller" r="5">
        <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={path} calcMode="spline"
          keyTimes="0;1" keySplines="0.45 0 0.25 1" />
      </circle>
    </g>
  )
}

// ── Is RAG That Simple? ─────────────────────────────────────────────────────

function Hrag() {
  const picked = new Set([3, 14, 22, 37, 45])
  const top = 548 // the contents box and the chosen section share one centre line
  const secX = (i) => top - 26 - (2 - i) * 66
  return (
    <Fig viewBox="0 0 720 300" label="Flat RAG picks five chunks from anywhere; hierarchical RAG reads the contents, picks one section, then five chunks inside it.">
      <g className="a"><text className="t-strong" x="20" y="24">Flat</text><text className="t" x="20" y="42">top 5 from anywhere</text></g>
      {Array.from({ length: 48 }, (_, i) => (
        <circle key={i} className={`a ${picked.has(i) ? 'dot-red' : 'dot'}`} style={d(picked.has(i) ? 900 + i * 12 : 100 + i * 10)}
          cx={30 + (i % 8) * 38} cy={80 + Math.floor(i / 8) * 36} r="6" />
      ))}
      <line className="rule" x1="360" y1="10" x2="360" y2="290" />
      <g className="a" style={d(100)}><text className="t-strong" x="390" y="24">Hierarchical</text><text className="t" x="390" y="42">contents first, then one section</text></g>
      <g className="a" style={d(200)}>
        <rect className="box" x={top - 55} y="62" width="110" height="30" />
        <text className="t-strong" x={top} y="82" textAnchor="middle">Contents</text>
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = secX(i)
        const cx = x + 26
        const on = i === 2
        return (
          <g key={i}>
            <Line path={on ? `M${top} 92 V130` : `M${top} 92 V106 H${cx} V130`} delay={400 + i * 60} />
            <g className="a" style={d(600 + i * 60)}>
              <rect className={on ? 'fill-red' : 'box'} x={x} y="130" width="52" height="30" />
              <text className={on ? 't-inv' : 't'} x={cx} y="150" textAnchor="middle">§{i + 1}</text>
            </g>
            {on && <Line path={`M${cx} 160 V196`} delay={1000} />}
            {(on ? [0, 1, 2, 3, 4] : [0, 1, 2]).map((j) => (
              <circle key={j} className={`a ${on ? 'dot-red' : 'dot'}`} style={d(on ? 1150 + j * 70 : 800)}
                cx={on ? cx - 32 + j * 16 : cx - 12 + j * 12} cy="208" r={on ? 6 : 4} />
            ))}
          </g>
        )
      })}
      <text className="t a" style={d(1500)} x="390" y="262">5 chunks, all from the section that matters</text>
      <Traveller path={`M${top} 92 V196`} dur={2.4} delay={1600} />
    </Fig>
  )
}

// ── Your Context Is Rotting ─────────────────────────────────────────────────

function Context() {
  const steps = 8
  const unit = 58
  return (
    <Fig viewBox="0 0 720 300" label="With each agent step, tool results pile into the context window; older ones go stale and the instructions become a smaller share.">
      <text className="t a" x="120" y="22">Context window →</text>
      <line className="limit" x1="682" y1="30" x2="682" y2="282" />
      <text className="t" x="676" y="22" textAnchor="end">limit</text>
      {Array.from({ length: steps }, (_, row) => (
        <g key={row}>
          <text className="t a" style={d(row * 180)} x="104" y={48 + row * 30} textAnchor="end">step {row + 1}</text>
          <rect className="fill-red a" style={d(row * 180)} x="120" y={34 + row * 30} width="56" height="20" />
          {Array.from({ length: row + 1 }, (_, k) => {
            const age = row - k
            return (
              <g key={k} className="a" style={d(row * 180 + k * 40)}>
                <rect className="ctx-block" x={180 + k * unit} y={34 + row * 30} width={unit - 4} height="20"
                  style={{ opacity: Math.max(0.14, 1 - age * 0.16) }} />
              </g>
            )
          })}
        </g>
      ))}
    </Fig>
  )
}

// ── The Agentic Shift ───────────────────────────────────────────────────────

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
  const ring = `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}`
  return (
    <Fig viewBox="0 0 720 300" label="An agent loops: perceive, reason, act, observe, towards a goal.">
      <path className="ring draw" pathLength="1" d={ring} />
      <text className="t-strong a" style={d(500)} x={cx} y={cy + 4} textAnchor="middle">Goal</text>
      {nodes.map(([label, x, y], i) => (
        <g key={label} className="a" style={d(300 + i * 150)}>
          <rect className="box box--paper" x={x - 44} y={y - 15} width="88" height="30" />
          <text className="t-strong" x={x} y={y + 5} textAnchor="middle">{label}</text>
        </g>
      ))}
      <g className="a" style={d(1000)}>
        <circle className="traveller" r="6">
          <animateMotion dur="6s" repeatCount="indefinite" path={ring} />
        </circle>
      </g>
      <g className="a" style={d(200)}>
        <text className="t-strong" x="20" y="120">Co-pilot</text>
        <text className="t" x="20" y="140">you ask, it answers,</text>
        <text className="t" x="20" y="158">you decide</text>
      </g>
      <g className="a" style={d(700)}>
        <text className="t-strong" x="700" y="120" textAnchor="end">Agent</text>
        <text className="t" x="700" y="140" textAnchor="end">it plans, acts, checks,</text>
        <text className="t" x="700" y="158" textAnchor="end">and goes round again</text>
      </g>
    </Fig>
  )
}

// ── Why Can't I Just Talk to My Bank? ───────────────────────────────────────

function Voice() {
  // Left: a phone tree. Every row is centred under its parent.
  const root = 180
  const l1 = [['1  Accounts', root - 100], ['2  Cards', root], ['3  Other', root + 100]] // centres
  const sub = (c, j) => c + (j ? 23 : -23)
  const hold = sub(root + 100, 1)
  // Right: one request, one agent, three actions, all centred on the agent.
  const agent = 545
  const acts = [['Open account', agent - 108], ['Update address', agent], ['Insure home', agent + 108]] // centres
  return (
    <Fig viewBox="0 0 720 300" label="A phone tree makes you find the right door and often ends in a hold queue; a voice agent takes your request in your own words and acts on it, handing over to a person with context when needed.">
      <g className="a"><text className="t-strong" x="20" y="24">Phone tree</text><text className="t" x="20" y="42">you find the right door</text></g>
      <g className="a" style={d(100)}>
        <rect className="box" x={root - 50} y="62" width="100" height="28" />
        <text className="t-strong" x={root} y="81" textAnchor="middle">Call</text>
      </g>
      {l1.map(([label, c], i) => (
        <g key={label}>
          <Line path={c === root ? `M${root} 90 V120` : `M${root} 90 V105 H${c} V120`} delay={250 + i * 60} />
          <g className="a" style={d(450 + i * 60)}>
            <rect className="box" x={c - 45} y="120" width="90" height="28" />
            <text className="t" x={c} y="139" textAnchor="middle">{label}</text>
          </g>
          {[0, 1].map((j) => (
            <g key={j}>
              <Line path={`M${c} 148 V160 H${sub(c, j)} V172`} delay={650 + i * 60} />
              <g className="a" style={d(800 + i * 60)}>
                <rect className="box" x={sub(c, j) - 14} y="172" width="28" height="22" />
                <text className="t" x={sub(c, j)} y="187" textAnchor="middle">{j + 1}</text>
              </g>
            </g>
          ))}
        </g>
      ))}
      <Line path={`M${hold} 194 V232`} delay={1050} />
      <g className="a" style={d(1200)}>
        <rect className="fill-red" x={hold - 60} y="232" width="120" height="28" />
        <text className="t-inv" x={hold} y="251" textAnchor="middle">Please hold</text>
      </g>
      <Traveller path={`M${root} 90 V105 H${root + 100} V160 H${hold} V232`} dur={3.6} delay={1400} />

      <line className="rule" x1="370" y1="10" x2="370" y2="290" />

      <g className="a" style={d(200)}><text className="t-strong" x="390" y="24">Voice agent</text><text className="t" x="390" y="42">the menu finds you</text></g>
      <g className="a" style={d(300)}>
        <rect className="box" x={agent - 155} y="62" width="310" height="34" />
        <text className="t" x={agent} y="84" textAnchor="middle">“I’ve just moved here and need an account.”</text>
      </g>
      <Line path={`M${agent} 96 V122`} delay={500} />
      <g className="a" style={d(650)}>
        <rect className="fill-red" x={agent - 50} y="122" width="100" height="28" />
        <text className="t-inv" x={agent} y="141" textAnchor="middle">Agent</text>
      </g>
      {acts.map(([label, c], i) => (
        <g key={label}>
          <Line path={c === agent ? `M${agent} 150 V178` : `M${agent} 150 V164 H${c} V178`} delay={800 + i * 80} />
          <g className="a" style={d(950 + i * 80)}>
            <rect className="box" x={c - 50} y="178" width="100" height="28" />
            <text className="t" x={c} y="197" textAnchor="middle">{label}</text>
          </g>
          <Traveller path={c === agent ? `M${agent} 96 V178` : `M${agent} 96 V164 H${c} V178`} dur={3} begin={i} delay={1400} />
        </g>
      ))}
      <g className="a" style={d(1250)}>
        <text className="t" x="390" y="240">checks, then acts in the bank’s own systems</text>
        <line className="limit" x1="390" y1="256" x2="420" y2="256" />
        <text className="t" x="428" y="260">hands over to a person, with the whole conversation</text>
      </g>
    </Fig>
  )
}

const FIGURES = { hrag: Hrag, context: Context, loop: Loop, voice: Voice }

export default function Figure({ id }) {
  const F = FIGURES[id]
  return F ? <F /> : null
}
