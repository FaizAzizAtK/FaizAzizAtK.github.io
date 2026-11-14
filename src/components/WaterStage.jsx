import { useEffect, useRef } from 'react'
import { Water } from '../water/Water'
import { Director } from '../water/director'

// The fixed sheet of water behind the page. Writing marked .water is set in the
// paper's own colour, so it can only be seen where pigment has reached. The GPU
// buffers are kept for the life of the page and simply cleared between routes.
let water = null

export default function WaterStage({ route, buildConfig, onActive }) {
  const canvas = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const el = canvas.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const phone = Math.min(innerWidth, innerHeight) < 600
    try {
      water ??= new Water(el, { simH: phone ? 160 : 256, dyeH: phone ? 540 : 1000, dpr: phone ? 1.25 : 1.5 })
      water.clear()
    } catch {
      root.classList.remove('water')
      return undefined
    }
    root.classList.add('water')
    window.__waterOK = true
    const director = new Director(water, { reduced })
    director.onActive = onActive
    window.__director = director
    // if the GPU drops us, the writing must not stay paper-coloured on blank paper
    const lost = () => { director.destroy(); root.classList.remove('water') }
    el.addEventListener('webglcontextlost', lost)
    const raf = requestAnimationFrame(() => director.mount(buildConfig()))
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('webglcontextlost', lost)
      director.destroy()
    }
    // the page config is rebuilt when the route changes
  }, [route])

  return <canvas ref={canvas} className="water-canvas" aria-hidden="true" />
}
