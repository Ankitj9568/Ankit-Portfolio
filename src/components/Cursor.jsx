import { useEffect, useRef } from 'react'

/* Neon dot + trailing ring cursor (desktop only). */
export default function Cursor() {
  const dot = useRef()
  const ring = useRef()

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return

    let mx = -100, my = -100, rx = -100, ry = -100
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      dot.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
    }
    const onHover3D = () => ring.current?.classList.add('is-hover')
    const onBlur3D = () => ring.current?.classList.remove('is-hover')
    const onOver = (e) => {
      ring.current?.classList.toggle('is-hover', !!e.target.closest('a, button, [data-hover]'))
    }
    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('akj-cursor-hover', onHover3D)
    window.addEventListener('akj-cursor-blur', onBlur3D)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('akj-cursor-hover', onHover3D)
      window.removeEventListener('akj-cursor-blur', onBlur3D)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
