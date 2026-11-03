import { useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import SolarStory from './story/SolarStory'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Lab from './components/Lab'
import Achievements from './components/Achievements'
import Journey from './components/Journey'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { addChapter, initProgress, recalc } from './story/progress'

/*
 * Through the solar system — every section is a chapter of the trip.
 * `side` shifts the content to the opposite edge of the screen, so the
 * planet of that chapter has room on the 3D layer behind.
 *   side-right = content on the right  → planet on the left
 *   side-left  = content on the left   → planet on the right
 */
function Chapter({ side, veil, children }) {
  const ref = useRef(null)
  useEffect(() => addChapter(ref.current), [])
  return (
    <div
      ref={ref}
      className={`chapter${side ? ` side-${side}` : ''}`}
      data-veil={veil || undefined}
    >
      {children}
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const off = initProgress()
    // recalibrate anchors once the real layout (fonts, models) has settled
    const t = setTimeout(recalc, 1200)
    window.addEventListener('load', recalc)
    return () => { off(); clearTimeout(t); window.removeEventListener('load', recalc) }
  }, [])

  return (
    <>
      <Cursor />
      <SolarStory />
      <Navbar />
      {/* main content floats above the fixed story canvas */}
      <main id="scroll-flow">
        <Chapter><Hero /></Chapter>
        <Chapter side="right"><About /></Chapter>
        <Chapter side="left"><Skills /></Chapter>
        <Chapter side="right"><Projects /></Chapter>
        <Chapter veil="lab"><Lab /></Chapter>
        <Chapter side="left"><Achievements /></Chapter>
        <Chapter side="right"><Journey /></Chapter>
        <Chapter side="left"><Contact /></Chapter>
      </main>
      <Footer />
    </>
  )
}
