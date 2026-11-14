import { useEffect, useRef } from 'react'

// A line drawing traced from a photograph (see scripts/trace-photo.mjs). It takes
// the writing's colour, so the paint reveals it too, and the strokes then draw
// themselves from the top down.
export default function Drawing({ data, label }) {
  const { viewBox, paths } = data
  const ref = useRef(null)
  const units = Number(viewBox.split(' ')[2])
  const overlap = Math.max(10, Math.round(paths.length / 5))

  // Strokes are in the photo's units, so keep them one thickness on screen at any size.
  useEffect(() => {
    const svg = ref.current
    const fit = () => {
      const width = svg.getBoundingClientRect().width
      if (width) svg.style.setProperty('--px', (units / width).toFixed(3))
    }
    const ro = new ResizeObserver(fit)
    ro.observe(svg)
    fit()
    return () => ro.disconnect()
  }, [units])

  return (
    <svg
      ref={ref}
      className="drawing__svg"
      viewBox={viewBox}
      role="img"
      aria-label={label}
      style={{ '--n': paths.length + overlap, '--w': overlap }}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} pathLength="1" className={p.heavy ? 'is-heavy' : undefined} style={{ '--i': i }} />
      ))}
    </svg>
  )
}
